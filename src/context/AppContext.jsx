import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { jobService } from '../services/jobService';
import { offerService } from '../services/offerService';
import { communityService } from '../services/communityService';
import { shopService } from '../services/shopService';
import { messageService } from '../services/messageService';
import { emailService } from '../services/emailService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // ── State ──────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [offers, setOffers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [likedPostIds, setLikedPostIds] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Veri Yükleme ──────────────────────────────────────
  const loadPublicData = useCallback(async () => {
    try {
      const [allProfiles, allJobs, allOffers, allPosts, allComments, allProducts] = await Promise.all([
        profileService.getAllProfiles(),
        jobService.getAllJobs(),
        offerService.getAllOffers(),
        communityService.getPosts(),
        communityService.getAllComments(),
        shopService.getAllProducts()
      ]);

      // Ürünleri profillere ekle (ShopProfile vs için)
      const profilesWithProducts = allProfiles.map(p => {
        if (p.role === 'dukkan') {
          return { ...p, products: allProducts.filter(pr => pr.shop_id === p.id) };
        }
        return p;
      });

      setUsers(profilesWithProducts);
      setJobs(allJobs.map(j => ({
        ...j,
        // UI uyumluluğu için field mapping
        isVip: j.is_vip,
        createdBy: j.created_by,
        selectedUsta: j.selected_usta,
        targetShopId: j.target_shop_id,
        finalScore: j.final_score,
        reviewText: j.review_text
      })));
      setOffers(allOffers.map(o => ({
        ...o,
        jobId: o.job_id,
        ustaId: o.usta_id,
        usta_name: o.usta_name
      })));
      setPosts(allPosts.map(p => ({
        ...p,
        likes: p.likes_count,
        comments: p.comments_count,
        liked_by: []
      })));
      setComments(allComments.map(c => ({
        ...c,
        post_id: c.post_id,
        author_name: c.author_name
      })));
      setProducts(allProducts);
    } catch (err) {
      console.error('Veri yükleme hatası:', err.message);
    }
  }, []);

  const loadUserData = useCallback(async (userId) => {
    try {
      const [
        portfolio, reviews, myFriends, myFriendRequests, likedIds, myMessages, myDMs
      ] = await Promise.all([
        profileService.getPortfolio(userId),
        profileService.getReviews(userId),
        communityService.getFriends(userId),
        communityService.getFriendRequests(userId),
        communityService.getLikedPostIds(userId),
        messageService.getAllMessages(),
        messageService.getDirectMessages(userId)
      ]);

      setFriends(myFriends);
      setFriendRequests(myFriendRequests);
      setLikedPostIds(likedIds);
      setMessages(myMessages.map(m => ({
        ...m,
        jobId: m.job_id,
        ustaId: m.usta_id,
        senderId: m.sender_id,
        timestamp: new Date(m.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      })));
      setDirectMessages(myDMs.map(m => ({
        ...m,
        senderId: m.sender_id,
        receiverId: m.receiver_id,
        timestamp: new Date(m.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      })));

      // currentUser'a portfolio ve reviews ekle
      setCurrentUser(prev => prev ? {
        ...prev,
        portfolio,
        reviews,
        friends: myFriends,
        friendRequests: myFriendRequests
      } : prev);

      // Users listesinde de güncelle
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, portfolio, reviews, friends: myFriends, friendRequests: myFriendRequests } : u
      ));
    } catch (err) {
      console.error('Kullanıcı veri hatası:', err.message);
    }
  }, []);

  // Login süresince onAuthStateChange müdahalesini engellemek için kilit
  const loginInProgress = useRef(false);

  // ── AUTH DİNLEYİCİ ─────────────────────────────────────
  useEffect(() => {
    loadPublicData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const hasUser = event === 'SIGNED_IN'
          || event === 'INITIAL_SESSION'
          || event === 'TOKEN_REFRESHED';

        if (hasUser && session?.user) {
          if (loginInProgress.current) {
            setAuthLoading(false);
            return;
          }

          const u = session.user;
          const meta = u.user_metadata || {};

          // 1. Anında kullanıcıyı set et — DB sorgusu YOK, hiç askıya girmez
          setCurrentUser(prev => {
            if (prev && prev.id === u.id) return prev;
            return {
              id: u.id,
              name: meta.name || u.email?.split('@')[0] || 'Kullanıcı',
              email: u.email,
              role: meta.role || 'musteri',
              rating: 0,
              completed_jobs: 0,
              badges: [],
              friends: [],
              friendRequests: [],
              portfolio: [],
              reviews: [],
            };
          });

          // 2. Arka planda gerçek profili çek ve birleştir (non-blocking)
          profileService.getProfile(u.id)
            .then(profile => {
              setCurrentUser(prev =>
                prev && prev.id === u.id ? { ...prev, ...profile } : prev
              );
              return loadUserData(u.id);
            })
            .catch(err => console.warn('[Auth] Arka plan profil hatası:', err.message));

        } else if (event === 'SIGNED_OUT') {
          if (!loginInProgress.current) {
            setCurrentUser(null);
            setFriends([]);
            setFriendRequests([]);
            setLikedPostIds([]);
            setMessages([]);
            setDirectMessages([]);
          }
        } else if (event === 'INITIAL_SESSION' && !session) {
          setCurrentUser(null);
        }

        setAuthLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // ← Sadece bir kez çalışır, subscription çoğaltılmaz


  // ── AUTH ──────────────────────────────────────────────
  const login = async (email, password) => {
    loginInProgress.current = true;
    try {
      setLoading(true);
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });

      if (error) throw error;

      return true;
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
        alert('❌ Kullanıcı adı veya şifre hatalı.');
      } else if (msg.includes('email not confirmed')) {
        alert('⚠️ Hesabınız onaylanmamış.');
      } else {
        alert('❌ Giriş başarısız: ' + err.message);
      }
      return false;
    } finally {
      setLoading(false);
      loginInProgress.current = false;
    }
  };

  const register = async (name, email, password, role) => {
    loginInProgress.current = true;
    try {
      setLoading(true);
      const cleanEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password.trim(),
        options: { data: { name, role } },
      });

      if (error) throw error;

      if (data?.user) {
        await new Promise(r => setTimeout(r, 800));
        let profile;
        try {
          profile = await profileService.getProfile(data.user.id);
        } catch {
          profile = { id: data.user.id, name, email: cleanEmail, role, rating: 0, completed_jobs: 0, badges: [] };
        }
        setCurrentUser({ ...profile, friends: [], friendRequests: [], portfolio: [], reviews: [] });
        loadUserData(data.user.id).catch(console.error);
      }
      return true;
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        alert('⚠️ Bu kullanıcı adı zaten alınmış.');
      } else {
        alert('❌ Kayıt başarısız: ' + msg);
      }
      return false;
    } finally {
      setLoading(false);
      loginInProgress.current = false;
    }
  };

  const logout = async () => {
    await authService.logout();
    setCart([]);
  };

  // ── JOBS ─────────────────────────────────────────────
  const createJob = async (title, description, budget, location, isVip, details, targetUstaId, targetShopId, category, area_m2, extra_options, estimated_price) => {
    if (!currentUser) return;
    try {
      const newJob = await jobService.createJob(currentUser.id, {
        title, description, budget, location, isVip, details, targetUstaId, targetShopId,
        category, area_m2, extra_options, estimated_price
      });
      const mapped = {
        ...newJob,
        isVip: newJob.is_vip,
        createdBy: newJob.created_by,
        selectedUsta: newJob.selected_usta,
        targetShopId: newJob.target_shop_id
      };
      setJobs(prev => [mapped, ...prev]);
      return true;
    } catch (err) {
      console.error('İş oluşturma hatası:', err.message);
      alert('İlan yayınlanamadı: ' + err.message);
      return false;
    }
  };

  const createOffer = async (jobId, price) => {
    if (!currentUser) return false;
    if (offers.find(o => (o.jobId || o.job_id) === jobId && (o.ustaId || o.usta_id) === currentUser.id)) return false;
    try {
      const newOffer = await offerService.createOffer(jobId, currentUser.id, currentUser.name, price);
      setOffers(prev => [...prev, { ...newOffer, jobId: newOffer.job_id, ustaId: newOffer.usta_id }]);

      // Email bildirimi: müşteriye yeni teklif geldi
      const job = jobs.find(j => j.id === jobId);
      const customer = users.find(u => u.id === job?.createdBy);
      if (customer?.email) {
        emailService.notifyNewOffer({
          customerEmail: customer.email,
          customerName: customer.name,
          ustaName: currentUser.name,
          jobTitle: job?.title || 'İş',
          price,
        });
      }

      return true;
    } catch (err) {
      console.error('Teklif hatası:', err.message);
      return false;
    }
  };

  // Teklif pazarlık fonksiyonları
  const counterOffer = async (offerId, newPrice, message) => {
    if (!currentUser) return;
    const byRole = currentUser.role === 'usta' ? 'usta' : 'musteri';
    try {
      const updated = await offerService.counterOffer(offerId, newPrice, message, byRole);
      setOffers(prev => prev.map(o => o.id === offerId ? { ...o, ...updated, jobId: updated.job_id, ustaId: updated.usta_id } : o));
    } catch (err) {
      console.error('Karşı teklif hatası:', err.message);
      alert('Hata: ' + err.message);
    }
  };

  const acceptOffer = async (offerId, jobId, ustaId) => {
    try {
      if (!currentUser) { alert('Lütfen önce giriş yapın.'); return; }
      await offerService.acceptOffer(offerId, jobId, ustaId);
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'Kapalı', selectedUsta: ustaId } : j));
      setOffers(prev => prev.map(o =>
        o.job_id === jobId
          ? { ...o, status: o.id === offerId ? 'Kabul Edildi' : 'Reddedildi' }
          : o
      ));

      // Email bildirimi: ustaya teklifi kabul edildi
      const job = jobs.find(j => j.id === jobId);
      const usta = users.find(u => u.id === ustaId);
      const offer = offers.find(o => o.id === offerId);
      if (usta?.email) {
        emailService.notifyOfferAccepted({
          ustaEmail: usta.email,
          ustaName: usta.name,
          jobTitle: job?.title || 'İş',
          price: offer?.counter_price || offer?.price || 0,
          customerName: currentUser.name,
        });
      }
    } catch (err) {
      console.error('Kabul hatası:', err.message);
      alert('Hata: ' + err.message);
    }
  };

  const rejectOffer = async (offerId) => {
    try {
      await offerService.rejectOffer(offerId);
      setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'Reddedildi' } : o));
    } catch (err) {
      console.error('Ret hatası:', err.message);
    }
  };

  const completeAndRateJob = async (jobId, scores, reviewText) => {
    if (!currentUser) return;
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    try {
      await jobService.completeJob(jobId, job.selectedUsta, scores, reviewText, currentUser.name);
      const finalScore = (Number(scores.speed) + Number(scores.quality)) / 2;
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'Tamamlandı', finalScore } : j));
      // Users listesini güncelle
      await loadPublicData();
    } catch (err) {
      console.error('Tamamlama hatası:', err.message);
    }
  };

  const respondToShopJob = async (jobId, accepted) => {
    try {
      await jobService.respondToShopJob(jobId, accepted);
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: accepted ? 'Kapalı' : 'Reddedildi' } : j));
    } catch (err) {
      console.error(err.message);
    }
  };

  const forwardShopJobToUsta = async (jobId, ustaId) => {
    try {
      await jobService.forwardShopJobToUsta(jobId, ustaId);
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, selectedUsta: ustaId, status: 'Mağaza İstedi' } : j));
    } catch (err) {
      console.error(err.message);
    }
  };

  // ── MESSAGES ─────────────────────────────────────────
  const sendMessage = async (jobId, ustaId, text) => {
    if (!currentUser) return;
    try {
      const msg = await messageService.sendMessage(jobId, ustaId, currentUser.id, text);
      const mapped = {
        ...msg,
        jobId: msg.job_id,
        ustaId: msg.usta_id,
        senderId: msg.sender_id,
        timestamp: new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, mapped]);
    } catch (err) {
      console.error(err.message);
    }
  };

  const sendDirectMessage = async (targetUserId, text) => {
    if (!currentUser) return;
    try {
      const msg = await messageService.sendDirectMessage(currentUser.id, targetUserId, text);
      const mapped = {
        ...msg,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        timestamp: new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      };
      setDirectMessages(prev => [...prev, mapped]);
    } catch (err) {
      console.error(err.message);
    }
  };

  // ── COMMUNITY ─────────────────────────────────────────
  const addPost = async (content, image) => {
    if (!currentUser) return;
    try {
      const newPost = await communityService.addPost(currentUser.id, content, image);
      setPosts(prev => [{
        ...newPost,
        likes: 0,
        comments: 0,
        liked_by: []
      }, ...prev]);
    } catch (err) {
      console.error(err.message);
    }
  };

  const toggleLikePost = async (postId) => {
    if (!currentUser) return;
    const isLiked = likedPostIds.includes(postId);
    try {
      await communityService.toggleLike(postId, currentUser.id, isLiked);
      setLikedPostIds(prev => isLiked ? prev.filter(id => id !== postId) : [...prev, postId]);
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, likes: isLiked ? p.likes - 1 : p.likes + 1 } : p
      ));
    } catch (err) {
      console.error(err.message);
    }
  };

  const addCommentToPost = async (postId, text) => {
    if (!currentUser || !text.trim()) return;
    try {
      const newComment = await communityService.addComment(postId, currentUser.id, currentUser.name, text);
      setComments(prev => [...prev, { ...newComment, post_id: newComment.post_id, author_name: newComment.author_name }]);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
    } catch (err) {
      console.error(err.message);
    }
  };

  // ── FRIENDS ──────────────────────────────────────────
  const sendFriendRequest = async (targetId) => {
    if (!currentUser) return;
    try {
      await communityService.sendFriendRequest(currentUser.id, targetId);
    } catch (err) {
      console.error(err.message);
    }
  };

  const acceptFriendRequest = async (fromId) => {
    if (!currentUser) return;
    try {
      await communityService.acceptFriendRequest(fromId, currentUser.id);
      setFriends(prev => [...prev, fromId]);
      setFriendRequests(prev => prev.filter(id => id !== fromId));
      setCurrentUser(prev => prev ? {
        ...prev,
        friends: [...(prev.friends || []), fromId],
        friendRequests: (prev.friendRequests || []).filter(id => id !== fromId)
      } : prev);
    } catch (err) {
      console.error(err.message);
    }
  };

  const rejectFriendRequest = async (fromId) => {
    if (!currentUser) return;
    try {
      await communityService.rejectFriendRequest(fromId, currentUser.id);
      setFriendRequests(prev => prev.filter(id => id !== fromId));
      setCurrentUser(prev => prev ? {
        ...prev,
        friendRequests: (prev.friendRequests || []).filter(id => id !== fromId)
      } : prev);
    } catch (err) {
      console.error(err.message);
    }
  };

  // ── SHOP / PRODUCTS ──────────────────────────────────
  const addProductToShop = async (shopId, product) => {
    try {
      const newProduct = await shopService.addProduct(shopId, product);
      setProducts(prev => [newProduct, ...prev]);
      setUsers(prev => prev.map(u => {
        if (u.id === shopId) {
          const updated = { ...u, products: [newProduct, ...(u.products || [])] };
          if (u.id === currentUser?.id) setCurrentUser(updated);
          return updated;
        }
        return u;
      }));
    } catch (err) {
      console.error(err.message);
    }
  };

  // ── CART (local state) ────────────────────────────────
  const addToCart = (product, quantity, selectedColor, selectedSize) => {
    const priceModifier = selectedSize?.priceOffset || 0;
    const cartItem = {
      ...product,
      cartItemId: 'ci' + Date.now(),
      quantity: Number(quantity),
      selectedColor,
      selectedSize,
      finalPrice: product.price + priceModifier
    };
    setCart(prev => [...prev, cartItem]);
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(item => (item.cartItemId || item.id) !== cartItemId));
  };

  const completeCheckout = () => {
    setCart([]);
  };

  // ── PORTFOLIO ─────────────────────────────────────────
  const addPortfolioItem = async (userId, item) => {
    try {
      const newItem = await profileService.addPortfolioItem(userId, item.url, item.description);
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          const updated = { ...u, portfolio: [newItem, ...(u.portfolio || [])] };
          if (u.id === currentUser?.id) setCurrentUser(updated);
          return updated;
        }
        return u;
      }));
    } catch (err) {
      console.error(err.message);
    }
  };

  // ── Posts'a liked_by ekle (UI uyumluluğu) ────────────
  const enrichedPosts = posts.map(p => ({
    ...p,
    liked_by: likedPostIds.includes(p.id) ? [currentUser?.id] : []
  }));

  // ── CurrentUser'ı friends ile zenginleştir ─────────────
  const enrichedCurrentUser = currentUser ? {
    ...currentUser,
    friends,
    friendRequests
  } : null;

  return (
    <AppContext.Provider value={{
      users,
      jobs,
      offers,
      currentUser: enrichedCurrentUser,
      messages,
      posts: enrichedPosts,
      comments,
      directMessages,
      cart,
      products,
      authLoading,
      loading,
      login,
      register,
      logout,
      createJob,
      createOffer,
      acceptOffer,
      counterOffer,
      rejectOffer,
      completeAndRateJob,
      sendMessage,
      sendDirectMessage,
      addPost,
      toggleLikePost,
      addCommentToPost,
      sendFriendRequest,
      acceptFriendRequest,
      rejectFriendRequest,
      addProductToShop,
      addToCart,
      removeFromCart,
      completeCheckout,
      addPortfolioItem,
      respondToShopJob,
      forwardShopJobToUsta,
      refreshData: loadPublicData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
