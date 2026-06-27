import logo from "./assets/logo.jpeg";
import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Upload, Users, MapPin, FileText, LogOut, Camera, BarChart3,
  Lock, CalendarDays, Home, PlusCircle, ChevronLeft, ChevronRight,
  Menu, X, TrendingUp, Shield, Zap,
} from "lucide-react";
import "./style.css";

const API = import.meta.env.VITE_API_URL || "https://shramjeevi-sanghatna-website.onrender.com";
const BAR_COLOR = "#d71920";
const PIE_COLORS = ["#d71920","#2563eb","#16a34a","#f59e0b","#7c3aed","#0891b2","#db2777","#65a30d"];

// FIX: Robust image URL - handles relative, absolute, and empty paths
function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // Ensure single slash between API base and path
  const base = API.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("ss_user") || "null"));
  const [lang, setLang] = useState(() => localStorage.getItem("ss_lang") || "mr"); // Marathi default
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [events, setEvents] = useState([]);
  const [adminEvents, setAdminEvents] = useState([]);

  const changeLanguage = (l) => { setLang(l); localStorage.setItem("ss_lang", l); };

  const labels = {
    mr: {
      org: "श्रमजीवी संघटना",
      subOrg: "महाराष्ट्र कार्यकर्ता अहवाल प्रणाली",
      loginTitle: "खात्यात लॉग इन करा",
      welcome: "परत स्वागत! कृपया तपशील भरा.",
      username: "वापरकर्ता नाव",
      password: "पासवर्ड",
      login: "लॉग इन",
      logout: "लॉगआउट",
      selectLanguage: "भाषा",
      demoAdmin: "डेमो प्रशासक",
      demoActivist: "डेमो कार्यकर्ता",
      invalidLogin: "लॉगिन चुकीचे आहे",
      passwordError: "पासवर्ड किमान ६ अक्षरांचा असावा.",
      hello: "नमस्कार",
      loading: "लोड होत आहे...",
      adminPanel: "CEO कामगिरी डॅशबोर्ड",
      activistPanel: "दैनिक कार्यकर्ता अहवाल",
      totalReports: "एकूण अहवाल",
      totalActivists: "एकूण कार्यकर्ते",
      districts: "जिल्हे",
      peopleReached: "संपर्कित लोक",
      districtPerformance: "जिल्हानिहाय कामगिरी तुलना",
      scoreNote: "गुणांकन अहवाल, संपर्कित लोक आणि छायाचित्र पुराव्यावर आधारित.",
      districtProductivity: "जिल्हा उत्पादकता",
      showActivistPerformance: "कार्यकर्त्यांची कामगिरी",
      showWorkDistribution: "कामाचे प्रकार",
      chartInstruction: "जिल्हास्तरीय विश्लेषण पाहण्यासाठी चार्ट निवडा.",
      activistName: "कार्यकर्त्याचे नाव",
      phone: "मोबाईल",
      district: "जिल्हा",
      reports: "अहवाल",
      score: "गुण",
      searchActivist: "कार्यकर्त्याचे नाव शोधा...",
      dayWiseProfile: "दिवसनिहाय कार्य अहवाल",
      name: "नाव",
      totalPeopleReached: "एकूण संपर्कित लोक",
      selectDate: "दिनांक निवडा",
      showAll: "सर्व दाखवा",
      dailyOperations: "दैनंदिन कामकाज",
      date: "दिनांक",
      category: "कार्य प्रकार",
      location: "ठिकाण",
      description: "वर्णन",
      image: "छायाचित्र",
      noImage: "नाही",
      noReport: "निवडलेल्या दिनांकासाठी अहवाल नाही.",
      submit: "अहवाल सबमिट करा",
      uploadImage: "छायाचित्रे अपलोड करा",
      selectedImages: "निवडलेली छायाचित्रे",
      reportSubmitted: "अहवाल यशस्वीरित्या सबमिट झाला",
      select: "निवडा",
      villageVisit: "गाव भेट",
      labourIssue: "कामगार समस्या सोडवली",
      meeting: "बैठक",
      awareness: "जनजागृती मोहीम",
      protest: "आंदोलन / मोर्चा",
      changePass: "पासवर्ड बदला",
      oldPass: "जुना पासवर्ड",
      newPass: "नवीन पासवर्ड",
      save: "जतन करा",
      cancel: "रद्द करा",
      landingTitle: "श्रमजीवी संघटना",
      landingSubtitle: "महाराष्ट्रातील कामगारांच्या हक्कासाठी एकजूट — दैनिक अहवाल, जिल्हानिहाय कामगिरी.",
      openLogin: "लॉगिन करा",
      backHome: "मुख्य पानावर",
      events: "कार्यक्रम",
      upcomingEvents: "नवीन कार्यक्रम",
      addEvent: "कार्यक्रम जोडा",
      eventTitle: "कार्यक्रमाचे शीर्षक",
      eventAdded: "कार्यक्रम यशस्वीरित्या जोडला",
      noEvents: "अजून कोणतेही कार्यक्रम नाहीत.",
      eventImage: "कार्यक्रमाचे छायाचित्र",
      adminOnly: "प्रशासक नियंत्रण",
      eventTitleMr: "मराठी शीर्षक",
      locationMr: "मराठी ठिकाण",
      descriptionMr: "मराठी वर्णन",
      latestEvent: "मुख्य पानावर दाखवा",
      outdatedEvent: "कालबाह्य म्हणून चिन्हांकित करा",
      status: "स्थिती",
      latest: "नवीन",
      outdated: "कालबाह्य",
      hidden: "लपवलेले",
      visible: "दृश्यमान",
      updateFailed: "बदल जतन झाले नाहीत",
      peopleReachedLabel: "लोकांपर्यंत पोहोचलो",
      tagline1: "कामगारांचे हक्क",
      tagline2: "आमची लढाई",
      tagline3: "आमचा विजय",
    },
    en: {
      org: "Shramjeevi Sanghatna",
      subOrg: "Maharashtra Activist Reporting System",
      loginTitle: "Log in to Your Account",
      welcome: "Welcome back! Please enter your details.",
      username: "User Name",
      password: "Password",
      login: "Log In",
      logout: "Logout",
      selectLanguage: "Language",
      demoAdmin: "Demo admin",
      demoActivist: "Demo activist",
      invalidLogin: "Invalid login or backend not running",
      passwordError: "Password must be at least 6 characters.",
      hello: "Hello",
      loading: "Loading dashboard...",
      adminPanel: "CEO Performance Dashboard",
      activistPanel: "Daily Activist Report",
      totalReports: "Total Reports",
      totalActivists: "Total Activists",
      districts: "Districts",
      peopleReached: "People Reached",
      districtPerformance: "District Performance Comparison",
      scoreNote: "Score based on reports, people reached, and image proof uploaded.",
      districtProductivity: "District Productivity",
      showActivistPerformance: "Activists' Performance",
      showWorkDistribution: "Work Type Distribution",
      chartInstruction: "Select a chart to view district-level analysis.",
      activistName: "Activist Name",
      phone: "Phone",
      district: "District",
      reports: "Reports",
      score: "Score",
      searchActivist: "Search activist by name...",
      dayWiseProfile: "Day-wise Work Profile",
      name: "Name",
      totalPeopleReached: "Total People Reached",
      selectDate: "Select Date",
      showAll: "Show All",
      dailyOperations: "Daily Operations",
      date: "Date",
      category: "Work Category",
      location: "Location",
      description: "Description",
      image: "Image",
      noImage: "No Image",
      noReport: "No work report found for selected date.",
      submit: "Submit Report",
      uploadImage: "Upload Images",
      selectedImages: "Selected images",
      reportSubmitted: "Report submitted successfully",
      select: "Select",
      villageVisit: "Village Visit",
      labourIssue: "Labour Issue Resolved",
      meeting: "Meeting",
      awareness: "Awareness Campaign",
      protest: "Protest / Morcha",
      changePass: "Change Password",
      oldPass: "Old Password",
      newPass: "New Password",
      save: "Save Changes",
      cancel: "Cancel",
      landingTitle: "Shramjeevi Sanghatna",
      landingSubtitle: "Daily work reports, district performance, and public events in one clear system.",
      openLogin: "Login",
      backHome: "Back Home",
      events: "Events",
      upcomingEvents: "Latest Events",
      addEvent: "Add Event",
      eventTitle: "Event Title",
      eventAdded: "Event added successfully",
      noEvents: "No events added yet.",
      eventImage: "Event Image",
      adminOnly: "Admin controls",
      eventTitleMr: "Event Title in Marathi",
      locationMr: "Location in Marathi",
      descriptionMr: "Description in Marathi",
      latestEvent: "Show on landing page",
      outdatedEvent: "Mark as outdated",
      status: "Status",
      latest: "Latest",
      outdated: "Outdated",
      hidden: "Hidden",
      visible: "Visible",
      updateFailed: "Update failed",
      peopleReachedLabel: "People Reached",
      tagline1: "Workers' Rights",
      tagline2: "Our Struggle",
      tagline3: "Our Victory",
    },
  }[lang];

  const t = labels;

  const loadEvents = async () => {
    try { const res = await axios.get(`${API}/events`); setEvents(res.data); }
    catch { setEvents([]); }
  };

  const loadAdminEvents = async () => {
    try { const res = await axios.get(`${API}/events/admin`); setAdminEvents(res.data); }
    catch { setAdminEvents([]); }
  };

  const refreshEvents = async () => { await Promise.all([loadEvents(), loadAdminEvents()]); };

  useEffect(() => { refreshEvents(); }, []);

  const logout = () => {
    localStorage.removeItem("ss_user");
    setUser(null);
    setShowLogin(false);
    refreshEvents();
  };

  if (!user) {
    return (
      <LandingPage
        events={events} setUser={setUser} lang={lang} setLang={changeLanguage}
        t={t} showLogin={showLogin} setShowLogin={setShowLogin}
      />
    );
  }

  return (
    <>
      {user.role === "admin" ? (
        <AdminDashboard user={user} logout={logout} t={t} lang={lang} setLang={changeLanguage}
          events={adminEvents} onEventsChanged={refreshEvents} onOpenPasswordModal={() => setShowPasswordModal(true)} />
      ) : (
        <WorkerDashboard user={user} logout={logout} t={t} lang={lang} setLang={changeLanguage}
          onOpenPasswordModal={() => setShowPasswordModal(true)} />
      )}
      {showPasswordModal && (
        <ChangePasswordModal user={user} t={t} onClose={() => setShowPasswordModal(false)} />
      )}
    </>
  );
}

function ChangePasswordModal({ user, t, onClose }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await axios.post(`${API}/change-password`, { user_id: user.id, old_password: oldPassword, new_password: newPassword });
      setSuccess("Password updated!");
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Update failed");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={18}/></button>
        <h2 className="modal-title"><Lock size={20}/> {t.changePass}</h2>
        <form className="reportForm" onSubmit={handleUpdate}>
          <label>{t.oldPass}</label>
          <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
          <label>{t.newPass}</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
          {error && <p className="errorText">{error}</p>}
          {success && <p className="success">{success}</p>}
          <div className="btn-row">
            <button type="button" className="btn-ghost" onClick={onClose}>{t.cancel}</button>
            <button type="submit" className="btn-primary">{t.save}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getName(item, lang) {
  if (!item) return "";
  return lang === "mr" ? item.name_mr || item.name : item.name;
}

function getDistrictName(item, lang) {
  if (!item) return "";
  if (lang === "mr") return item.district_name_mr || item.name_mr || item.district_name || item.name;
  return item.district_name || item.name;
}

function translateCategory(category, lang) {
  if (lang !== "mr") return category;
  const map = {
    "Village Visit": "गाव भेट",
    "Labour Issue Resolved": "कामगार समस्या सोडवली",
    "Meeting": "बैठक",
    "Awareness Campaign": "जनजागृती मोहीम",
    "Protest / Morcha": "आंदोलन / मोर्चा",
  };
  return map[category] || category;
}

function getEventText(event, field, lang) {
  if (!event) return "";
  if (lang === "mr") return event[`${field}_mr`] || event[field] || "";
  return event[field] || event[`${field}_mr`] || "";
}

function Logo({ size = "md" }) {
  const sz = size === "sm" ? 52 : size === "lg" ? 100 : 70;
  return (
    <div className={`logo-ring logo-${size}`} style={{ width: sz, height: sz }}>
      <img src={logo} alt="श्रमजीवी संघटना" />
    </div>
  );
}

function LanguageToggle({ lang, setLang, t }) {
  return (
    <div className="lang-toggle">
      <span className="lang-label">{t.selectLanguage}:</span>
      <div className="lang-pills">
        <button className={`lang-pill ${lang === "mr" ? "active" : ""}`} onClick={() => setLang("mr")}>मराठी</button>
        <button className={`lang-pill ${lang === "en" ? "active" : ""}`} onClick={() => setLang("en")}>Eng</button>
      </div>
    </div>
  );
}

// ─── LANDING PAGE ───────────────────────────────────────────────────────────────

function LandingPage({ events, setUser, lang, setLang, t, showLogin, setShowLogin }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Touch swipe for mobile login panel
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 60) setShowLogin(true);   // swipe left → open login
    if (diff < -60) setShowLogin(false); // swipe right → close
    touchStartX.current = null;
  };

  return (
    <div className={`landing ${showLogin ? "login-open" : ""}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* NAV */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <Logo size="sm" />
          <div className="nav-brand-text">
            <b>{t.org}</b>
            <span>{t.subOrg}</span>
          </div>
        </div>

        <div className="nav-actions">
          <LanguageToggle lang={lang} setLang={setLang} t={t} />
          <button className="btn-login-nav" onClick={() => setShowLogin(true)}>
            <Lock size={15} /> {t.openLogin}
          </button>
          <button className="nav-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <LanguageToggle lang={lang} setLang={setLang} t={t} />
          <button className="btn-primary full-width" onClick={() => { setShowLogin(true); setMobileMenuOpen(false); }}>
            <Lock size={16}/> {t.openLogin}
          </button>
        </div>
      )}

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-badges">
            <span className="badge-red">{t.tagline1}</span>
            <span className="badge-outline">{t.tagline2}</span>
            <span className="badge-outline">{t.tagline3}</span>
          </div>
          <h1 className="hero-title">{t.landingTitle}</h1>
          <p className="hero-sub">{t.landingSubtitle}</p>

          <div className="hero-cta-group">
            <button className="btn-hero-primary" onClick={() => setShowLogin(true)}>
              <Lock size={18}/> {t.openLogin}
            </button>
            <div className="hero-swipe-hint">
              <ChevronLeft size={14}/> {lang === "mr" ? "डावीकडे स्वाइप करा" : "Swipe left to login"}
            </div>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <TrendingUp size={20}/>
              <div>
                <b>{events.length}</b>
                <span>{t.upcomingEvents}</span>
              </div>
            </div>
            <div className="hero-stat-divider"/>
            <div className="hero-stat">
              <Shield size={20}/>
              <div>
                <b>24/7</b>
                <span>{lang === "mr" ? "उपलब्ध" : "Available"}</span>
              </div>
            </div>
            <div className="hero-stat-divider"/>
            <div className="hero-stat">
              <Zap size={20}/>
              <div>
                <b>{lang === "mr" ? "जलद" : "Fast"}</b>
                <span>{lang === "mr" ? "अहवाल" : "Reports"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-card">
            <Logo size="lg"/>
            <div className="hero-card-text">
              <span>{t.upcomingEvents}</span>
              <b>{events.length}</b>
            </div>
            <div className="hero-card-footer">
              <CalendarDays size={16}/>
              <span>{lang === "mr" ? "महाराष्ट्र संघटना" : "Maharashtra Network"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* EVENTS SECTION */}
      <section className="events-section">
        <div className="section-header">
          <CalendarDays size={24}/>
          <h2>{t.upcomingEvents}</h2>
        </div>
        <EventSlider events={events} t={t} lang={lang}/>
      </section>

      {/* LOGIN DRAWER */}
      <div className="login-drawer" aria-hidden={!showLogin}>
        <div className="login-drawer-inner">
          <button className="drawer-back" onClick={() => setShowLogin(false)}>
            <ChevronLeft size={18}/> {t.backHome}
          </button>
          <Login setUser={setUser} lang={lang} setLang={setLang} t={t}/>
        </div>
      </div>

      {/* BACKDROP */}
      {showLogin && <div className="drawer-backdrop" onClick={() => setShowLogin(false)}/>}
    </div>
  );
}

function EventSlider({ events, t, lang }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStart = useRef(null);

  useEffect(() => {
    if (events.length <= 1) return;
    const timer = setInterval(() => setActiveIndex(i => (i + 1) % events.length), 4500);
    return () => clearInterval(timer);
  }, [events.length]);

  useEffect(() => {
    if (activeIndex >= events.length) setActiveIndex(0);
  }, [activeIndex, events.length]);

  if (!events.length) return <div className="empty-events">{t.noEvents}</div>;

  const move = (dir) => setActiveIndex(i => dir === "next" ? (i + 1) % events.length : (i - 1 + events.length) % events.length);

  return (
    <div className="slider-wrap"
      onTouchStart={e => { touchStart.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        if (!touchStart.current) return;
        const diff = touchStart.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) move(diff > 0 ? "next" : "prev");
        touchStart.current = null;
      }}
    >
      <div className="slider-track">
        {events.map((ev, i) => (
          <article key={ev.id} className={`slide ${i === activeIndex ? "active" : ""}`} aria-hidden={i !== activeIndex}>
            <div className="slide-img">
              {ev.image_url
                ? <img src={mediaUrl(ev.image_url)} alt={getEventText(ev, "title", lang)} loading="lazy" onError={e => { e.target.style.display="none"; }}/>
                : <CalendarDays size={48}/>
              }
            </div>
            <div className="slide-body">
              <span className="event-date-chip">{ev.date}</span>
              <h3>{getEventText(ev, "title", lang)}</h3>
              <p className="event-loc"><MapPin size={14}/>{getEventText(ev, "location", lang)}</p>
              <p className="event-desc">{getEventText(ev, "description", lang)}</p>
            </div>
          </article>
        ))}
      </div>

      {events.length > 1 && (
        <div className="slider-controls">
          <button className="slider-arrow" onClick={() => move("prev")} aria-label="Previous"><ChevronLeft size={18}/></button>
          <div className="slider-dots">
            {events.map((ev, i) => (
              <button key={ev.id} className={`dot ${i === activeIndex ? "active" : ""}`} onClick={() => setActiveIndex(i)} aria-label={`Event ${i+1}`}/>
            ))}
          </div>
          <button className="slider-arrow" onClick={() => move("next")} aria-label="Next"><ChevronRight size={18}/></button>
        </div>
      )}
    </div>
  );
}

function EventGrid({ events, t, lang, user, onEventsChanged }) {
  if (!events.length) return <div className="empty-events">{t.noEvents}</div>;
  return (
    <div className="event-grid">
      {events.map(ev => (
        <article className="event-card" key={ev.id}>
          <div className="event-img">
            {ev.image_url
              ? <img src={mediaUrl(ev.image_url)} alt={getEventText(ev, "title", lang)} loading="lazy" onError={e => { e.target.style.display="none"; }}/>
              : <CalendarDays size={40}/>
            }
          </div>
          <div className="event-body">
            <span className="event-date-chip">{ev.date}</span>
            <h3>{getEventText(ev, "title", lang)}</h3>
            <p className="event-loc"><MapPin size={14}/>{getEventText(ev, "location", lang)}</p>
            <p>{getEventText(ev, "description", lang)}</p>
            {user && onEventsChanged && <EventStatusControls event={ev} t={t} user={user} onEventsChanged={onEventsChanged}/>}
          </div>
        </article>
      ))}
    </div>
  );
}

function EventStatusControls({ event, t, user, onEventsChanged }) {
  const update = async (updates) => {
    try {
      await axios.patch(`${API}/events/${event.id}`, { admin_id: user.id, ...updates });
      onEventsChanged();
    } catch { alert(t.updateFailed); }
  };

  const fixImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("admin_id", user.id);
    fd.append("image", file);
    try {
      await axios.put(`${API}/events/${event.id}/image`, fd);
      onEventsChanged();
      alert("✅ Image updated successfully!");
    } catch (err) {
      alert("❌ Failed to update image: " + (err?.response?.data?.detail || err.message));
    }
    e.target.value = "";
  };

  const isBrokenImage = event.image_url && (
    event.image_url.startsWith("/uploads/") ||
    event.image_url.startsWith("uploads/")
  );
  const isVisible = event.is_latest && !event.is_outdated;

  return (
    <div className="event-status-box">
      <span className={`status-pill ${isVisible ? "status-visible" : "status-hidden"}`}>
        {isVisible ? t.visible : t.hidden}
      </span>
      <label className="check-row">
        <input type="checkbox" checked={Boolean(event.is_latest)} onChange={e => update({ is_latest: e.target.checked })}/>
        {t.latestEvent}
      </label>
      <label className="check-row">
        <input type="checkbox" checked={Boolean(event.is_outdated)} onChange={e => update({ is_outdated: e.target.checked })}/>
        {t.outdatedEvent}
      </label>
      {/* Fix broken local /uploads/ image — re-upload to Supabase */}
      <label className="fix-image-btn" title={isBrokenImage ? "⚠️ Image is broken (local path). Click to re-upload." : "Replace image"}>
        <Camera size={14}/>
        {isBrokenImage ? " ⚠️ Fix Image" : " Replace Image"}
        <input type="file" accept="image/*" style={{display:"none"}} onChange={fixImage}/>
      </label>
    </div>
  );
}

function EventForm({ user, t, onEventsChanged }) {
  const [form, setForm] = useState({
    title: "", title_mr: "",
    date: new Date().toISOString().slice(0, 10),
    location: "", location_mr: "",
    description: "", description_mr: "",
    is_latest: true, is_outdated: false,
  });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("admin_id", user.id);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append("image", image);
    await axios.post(`${API}/events`, fd);
    setMessage(t.eventAdded);
    setForm({ title: "", title_mr: "", date: new Date().toISOString().slice(0,10), location: "", location_mr: "", description: "", description_mr: "", is_latest: true, is_outdated: false });
    setImage(null);
    onEventsChanged();
  };

  return (
    <div className="panel">
      <h2><PlusCircle size={20}/> {t.addEvent}</h2>
      <form className="reportForm" onSubmit={submit}>
        <label>{t.eventTitle}</label>
        <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required/>
        <label>{t.eventTitleMr}</label>
        <input value={form.title_mr} onChange={e => setForm({...form, title_mr: e.target.value})}/>
        <label>{t.date}</label>
        <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required/>
        <label>{t.location}</label>
        <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} required/>
        <label>{t.locationMr}</label>
        <input value={form.location_mr} onChange={e => setForm({...form, location_mr: e.target.value})}/>
        <label>{t.description}</label>
        <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required/>
        <label>{t.descriptionMr}</label>
        <textarea value={form.description_mr} onChange={e => setForm({...form, description_mr: e.target.value})}/>
        <label>{t.eventImage}</label>
        <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)}/>
        <label className="check-row">
          <input type="checkbox" checked={form.is_latest} onChange={e => setForm({...form, is_latest: e.target.checked})}/>
          {t.latestEvent}
        </label>
        <label className="check-row">
          <input type="checkbox" checked={form.is_outdated} onChange={e => setForm({...form, is_outdated: e.target.checked})}/>
          {t.outdatedEvent}
        </label>
        <button className="btn-primary"><PlusCircle size={18}/> {t.addEvent}</button>
        {message && <p className="success">{message}</p>}
      </form>
    </div>
  );
}

function Login({ setUser, lang, setLang, t }) {
  const [phone, setPhone] = useState("8329405166");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await axios.post(`${API}/login`, { phone, password });
      localStorage.setItem("ss_user", JSON.stringify(res.data));
      setUser(res.data);
    } catch { setError(t.invalidLogin); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-card">
      <Logo size="lg"/>
      <h1 className="login-org">{t.org}</h1>
      <p className="login-tagline">{t.loginTitle}</p>
      <p className="login-sub">{t.welcome}</p>
      <form className="reportForm" onSubmit={login}>
        <label>{t.username}</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} autoComplete="username"/>
        <label>{t.password}</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password"/>
        {password.length > 0 && password.length < 6 && <p className="errorText">{t.passwordError}</p>}
        {error && <div className="alert">{error}</div>}
        <LanguageToggle lang={lang} setLang={setLang} t={t}/>
        <button className="btn-primary full-width" disabled={loading}>
          {loading ? (lang === "mr" ? "लोड होत आहे..." : "Loading...") : t.login}
        </button>
        <p className="hint">
          {t.demoAdmin}: 9999999999 / 123456<br/>
          {t.demoActivist}: 8329405166 / 123456
        </p>
      </form>
    </div>
  );
}

// ─── HEADER ──────────────────────────────────────────────────────────────────

function Header({ title, logout, t, lang, setLang, onOpenPasswordModal }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="nav-brand">
        <Logo size="sm"/>
        <div className="nav-brand-text">
          <b>{t.org}</b>
          <span>{t.subOrg}</span>
        </div>
      </div>

      <h2 className="topbar-title">{title}</h2>

      <div className="topbar-actions">
        <LanguageToggle lang={lang} setLang={setLang} t={t}/>
        <button className="btn-ghost" onClick={onOpenPasswordModal}><Lock size={15}/> {t.changePass}</button>
        <button className="btn-ghost danger" onClick={logout}><LogOut size={15}/> {t.logout}</button>
      </div>

      {/* Mobile header menu */}
      <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22}/> : <Menu size={22}/>}</button>
      {menuOpen && (
        <div className="mobile-menu full-nav-menu">
          <LanguageToggle lang={lang} setLang={setLang} t={t}/>
          <button className="btn-ghost" onClick={() => { onOpenPasswordModal(); setMenuOpen(false); }}><Lock size={15}/> {t.changePass}</button>
          <button className="btn-ghost danger" onClick={logout}><LogOut size={15}/> {t.logout}</button>
        </div>
      )}
    </header>
  );
}

// ─── WORKER DASHBOARD ────────────────────────────────────────────────────────

function WorkerDashboard({ user, logout, t, lang, setLang, onOpenPasswordModal }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: "", location: "", description: "", people_reached: 0,
  });
  const [images, setImages] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append("worker_id", user.id);
    images.forEach(img => fd.append("images", img));
    await axios.post(`${API}/reports`, fd);
    setMsg(t.reportSubmitted);
    setForm({ ...form, category: "", location: "", description: "", people_reached: 0 });
    setImages([]);
    setLoading(false);
  };

  const addImages = (e) => {
    setImages(prev => [...prev, ...Array.from(e.target.files)]);
    e.target.value = "";
  };

  return (
    <>
      <Header title={t.activistPanel} logout={logout} t={t} lang={lang} setLang={setLang} onOpenPasswordModal={onOpenPasswordModal}/>
      <section className="page">
        <div className="worker-hero">
          <div className="worker-hero-avatar">{getName(user, lang).charAt(0)}</div>
          <div>
            <h2>{t.hello}, {getName(user, lang)}</h2>
            <p className="muted"><MapPin size={14}/> {getDistrictName(user, lang)}</p>
          </div>
        </div>

        <div className="panel">
          <h2><FileText size={20}/> {t.activistPanel}</h2>
          <form className="reportForm" onSubmit={submit}>
            <label>{t.date}</label>
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required/>
            <label>{t.category}</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
              <option value="">{t.select}</option>
              <option value="Village Visit">{t.villageVisit}</option>
              <option value="Labour Issue Resolved">{t.labourIssue}</option>
              <option value="Meeting">{t.meeting}</option>
              <option value="Awareness Campaign">{t.awareness}</option>
              <option value="Protest / Morcha">{t.protest}</option>
            </select>
            <label>{t.location}</label>
            <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} required/>
            <label>{t.description}</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required/>
            <label>{t.peopleReached}</label>
            <input type="number" value={form.people_reached} onChange={e => setForm({...form, people_reached: e.target.value})} min={0}/>
            <label className="file-label"><Camera size={16}/> {t.uploadImage}</label>
            <input type="file" accept="image/*" multiple onChange={addImages}/>
            {images.length > 0 && (
              <div className="image-list">
                <p className="muted">{t.selectedImages}: {images.length}</p>
                {images.map((img, i) => (
                  <div key={i} className="image-item">
                    <span>{img.name}</span>
                    <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}>×</button>
                  </div>
                ))}
              </div>
            )}
            <button className="btn-primary full-width" disabled={loading}>
              <Upload size={18}/> {loading ? "..." : t.submit}
            </button>
            {msg && <p className="success">{msg}</p>}
          </form>
        </div>
      </section>
    </>
  );
}

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────

function MarathiNamesPanel({ user, districts, onRefresh }) {
  const [allUsers, setAllUsers] = useState([]);
  const [savingAll, setSavingAll] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [drafts, setDrafts] = useState({});
  const [districtDrafts, setDistrictDrafts] = useState({});

  const loadUsers = async () => {
    try {
      const res = await axios.get(`${API}/users`, { params: { admin_id: user.id } });
      setAllUsers(res.data);
      const d = {};
      res.data.forEach(u => { d[u.id] = u.name_mr || ""; });
      setDrafts(d);
    } catch { setAllUsers([]); }
  };

  useEffect(() => {
    loadUsers();
    const d = {};
    districts.forEach(dist => { d[dist.id] = dist.name_mr || ""; });
    setDistrictDrafts(d);
  }, [districts]);

  // ✅ Save ALL names in one request
  const saveAll = async () => {
    setSavingAll(true);
    setSaveMsg("");
    try {
      const res = await axios.post(`${API}/bulk-names`, {
        admin_id: user.id,
        users: drafts,
        districts: districtDrafts,
      });
      setSaveMsg("✅ " + res.data.message);
      await loadUsers();
      if (onRefresh) onRefresh();
    } catch (err) {
      setSaveMsg("❌ Save failed: " + (err?.response?.data?.detail || err.message));
    }
    setSavingAll(false);
  };

  const activists = allUsers.filter(u => u.role === "activist");
  const missingCount = activists.filter(u => !drafts[u.id]).length
    + districts.filter(d => !districtDrafts[d.id]).length;

  return (
    <div className="panel">
      <div className="marathi-panel-header">
        <div>
          <h2>🇮🇳 मराठी नावे सेट करा — Set Marathi Names</h2>
          <p className="score-note">
            सर्व नावे भरा आणि खाली एकाच "सर्व जतन करा" बटणावर क्लिक करा.<br/>
            Fill all names below, then click <b>Save All at Once</b>. ⚠️ = name missing ({missingCount} remaining)
          </p>
        </div>
        <div className="save-all-box">
          <button className="btn-save-all" onClick={saveAll} disabled={savingAll}>
            {savingAll ? "⏳ Saving..." : "💾 सर्व जतन करा — Save All"}
          </button>
          {saveMsg && <p className={saveMsg.startsWith("✅") ? "success" : "errorText"} style={{marginTop:"0.4rem", fontSize:"0.82rem"}}>{saveMsg}</p>}
        </div>
      </div>

      {/* Districts */}
      <h3 style={{margin:"1.25rem 0 0.75rem", color:"var(--primary)"}}>जिल्हे — Districts</h3>
      <div className="marathi-names-grid">
        {districts.map(d => (
          <div key={d.id} className={`marathi-row ${!districtDrafts[d.id] ? "missing" : ""}`}>
            <span className="eng-name">{d.name} {!districtDrafts[d.id] && "⚠️"}</span>
            <input
              className="marathi-input"
              placeholder="मराठी नाव टाका..."
              value={districtDrafts[d.id] || ""}
              onChange={e => setDistrictDrafts(p => ({ ...p, [d.id]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      {/* Workers */}
      <h3 style={{margin:"1.5rem 0 0.75rem", color:"var(--primary)"}}>कार्यकर्ते — Activists</h3>
      <div className="marathi-names-grid">
        {activists.map(u => (
          <div key={u.id} className={`marathi-row ${!drafts[u.id] ? "missing" : ""}`}>
            <span className="eng-name">{u.name} <small className="muted">({u.district_name})</small> {!drafts[u.id] && "⚠️"}</span>
            <input
              className="marathi-input"
              placeholder="मराठी नाव टाका..."
              value={drafts[u.id] || ""}
              onChange={e => setDrafts(p => ({ ...p, [u.id]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      {/* Save All button at bottom too */}
      <button className="btn-save-all" style={{marginTop:"1.5rem", width:"100%"}} onClick={saveAll} disabled={savingAll}>
        {savingAll ? "⏳ Saving..." : "💾 सर्व जतन करा — Save All at Once"}
      </button>
      {saveMsg && <p className={saveMsg.startsWith("✅") ? "success" : "errorText"} style={{marginTop:"0.5rem", textAlign:"center"}}>{saveMsg}</p>}
    </div>
  );
}

function AdminDashboard({ user, logout, t, lang, setLang, events, onEventsChanged, onOpenPasswordModal }) {
  const [data, setData] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [activeChart, setActiveChart] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const loadAll = () => {
    axios.get(`${API}/dashboard`).then(r => setData(r.data));
    axios.get(`${API}/districts`).then(r => setDistricts(r.data));
  };

  useEffect(() => { loadAll(); }, []);

  const openDistrict = (d) => {
    const dd = data.districts.find(x => x.id === d.id);
    setSelectedDistrict({ ...d, dashboard: dd });
    setSelectedWorker(null); setSearchTerm(""); setSelectedDate(""); setActiveChart(null);
  };

  const openWorker = async (id) => {
    const res = await axios.get(`${API}/workers/${id}`);
    setSelectedWorker(res.data); setSelectedDate("");
  };

  if (!data) return <div className="loading-screen"><div className="spinner"/><p>{t.loading}</p></div>;

  const districtChartData = data.districts.map(d => ({ ...d, displayName: getName(d, lang) }));
  const filteredWorkers = selectedDistrict
    ? selectedDistrict.workers.filter(w => `${w.name} ${w.name_mr}`.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];
  const workerReports = selectedWorker
    ? selectedWorker.reports.filter(r => selectedDate ? r.date === selectedDate : true)
    : [];
  const workerChartData = (selectedDistrict?.dashboard?.workers || []).map(w => ({ ...w, displayName: getName(w, lang) }));
  const categoryData = (selectedDistrict?.dashboard?.category_data || []).map(item => ({ ...item, name: translateCategory(item.name, lang) }));

  return (
    <>
      <Header title={t.adminPanel} logout={logout} t={t} lang={lang} setLang={setLang} onOpenPasswordModal={onOpenPasswordModal}/>
      <section className="page">
        {/* Marathi Names Manager */}
        <MarathiNamesPanel user={user} districts={districts} onRefresh={loadAll}/>

        {/* Events management */}
        <div className="admin-event-grid">
          <EventForm user={user} t={t} onEventsChanged={onEventsChanged}/>
          <div className="panel">
            <h2><CalendarDays size={20}/> {t.upcomingEvents}</h2>
            <EventGrid events={events} t={t} lang={lang} user={user} onEventsChanged={onEventsChanged}/>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <Stat icon={<FileText/>} label={t.totalReports} value={data.summary.total_reports}/>
          <Stat icon={<Users/>} label={t.totalActivists} value={data.summary.total_workers}/>
          <Stat icon={<MapPin/>} label={t.districts} value={data.summary.total_districts}/>
          <Stat icon={<BarChart3/>} label={t.peopleReached} value={data.summary.people_reached}/>
        </div>

        {/* District chart */}
        <div className="panel">
          <h2>{t.districtPerformance}</h2>
          <p className="score-note">{t.scoreNote}</p>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={districtChartData} margin={{ top: 16, right: 16, left: 8, bottom: 60 }}>
              <XAxis dataKey="displayName" interval={0} tick={{ fontSize: 13 }} tickMargin={10}/>
              <YAxis allowDecimals={false} tick={{ fontSize: 13 }}/>
              <Tooltip/>
              <Bar dataKey="score" fill={BAR_COLOR} radius={[8,8,0,0]} barSize={44}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* District cards */}
        <div className="panel">
          <h2>{t.districts}</h2>
          <div className="district-cards">
            {districts.map(d => (
              <button key={d.id} className={`district-card ${selectedDistrict?.id === d.id ? "active" : ""}`} onClick={() => openDistrict(d)}>
                <MapPin size={20}/>
                <h3>{getName(d, lang)}</h3>
                <p>{d.workers.length} {t.totalActivists}</p>
              </button>
            ))}
          </div>
        </div>

        {/* District detail */}
        {selectedDistrict && (
          <>
            <div className="panel">
              <h2>{getName(selectedDistrict, lang)} — {t.districtProductivity}</h2>
              <p className="score-note">{t.chartInstruction}</p>
              <div className="chart-btn-row">
                <button className={`btn-chart ${activeChart === "performance" ? "active" : ""}`} onClick={() => setActiveChart("performance")}>
                  <BarChart3 size={16}/> {t.showActivistPerformance}
                </button>
                <button className={`btn-chart ${activeChart === "workType" ? "active" : ""}`} onClick={() => setActiveChart("workType")}>
                  <PieChart size={16}/> {t.showWorkDistribution}
                </button>
              </div>

              {activeChart === "performance" && (
                <ResponsiveContainer width="100%" height={Math.max(380, workerChartData.length * 48)}>
                  <BarChart data={workerChartData} layout="vertical" margin={{ top: 16, right: 24, left: 100, bottom: 16 }}>
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 13 }}/>
                    <YAxis type="category" dataKey="displayName" width={140} interval={0} tick={{ fontSize: 13 }}/>
                    <Tooltip/>
                    <Bar dataKey="score" fill={BAR_COLOR} radius={[0,8,8,0]} barSize={24}/>
                  </BarChart>
                </ResponsiveContainer>
              )}

              {activeChart === "workType" && (
                categoryData.length === 0
                  ? <p className="muted">{t.noReport}</p>
                  : <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={130} innerRadius={55} paddingAngle={4} label={({name, value}) => `${name}: ${value}`}>
                          {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
                        </Pie>
                        <Tooltip/><Legend/>
                      </PieChart>
                    </ResponsiveContainer>
              )}
            </div>

            {/* Workers table */}
            <div className="panel">
              <h2>{getName(selectedDistrict, lang)} — {t.totalActivists}</h2>
              <input className="search-input" placeholder={t.searchActivist} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t.activistName}</th><th>{t.phone}</th><th>{t.district}</th>
                      <th>{t.reports}</th><th>{t.peopleReached}</th><th>{t.score}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkers.map(w => {
                      const perf = selectedDistrict.dashboard?.workers.find(x => x.id === w.id);
                      return (
                        <tr key={w.id}>
                          <td><button className="name-btn" onClick={() => openWorker(w.id)}>{getName(w, lang)}</button></td>
                          <td>{w.phone}</td>
                          <td>{getDistrictName(w, lang)}</td>
                          <td>{perf?.reports || 0}</td>
                          <td>{perf?.people_reached || 0}</td>
                          <td><span className="score-badge">{perf?.score || 0}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Worker detail */}
        {selectedWorker && (
          <div className="panel">
            <h2>{getName(selectedWorker, lang)} — {t.dayWiseProfile}</h2>
            <div className="worker-profile-grid">
              <div className="profile-item"><span>{t.name}</span><b>{getName(selectedWorker, lang)}</b></div>
              <div className="profile-item"><span>{t.phone}</span><b>{selectedWorker.phone}</b></div>
              <div className="profile-item"><span>{t.district}</span><b>{getDistrictName(selectedWorker, lang)}</b></div>
              <div className="profile-item"><span>{t.totalReports}</span><b>{selectedWorker.total_reports}</b></div>
              <div className="profile-item"><span>{t.totalPeopleReached}</span><b>{selectedWorker.total_people_reached}</b></div>
            </div>

            <div className="date-filter-row">
              <label>{t.selectDate}:</label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{width:"auto"}}/>
              {selectedDate && <button className="btn-ghost" onClick={() => setSelectedDate("")}>{t.showAll}</button>}
            </div>

            <h3 style={{marginBottom:"1rem", color:"var(--primary)"}}>{t.dailyOperations}</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t.date}</th><th>{t.category}</th><th>{t.location}</th>
                    <th>{t.description}</th><th>{t.peopleReached}</th><th>{t.image}</th>
                  </tr>
                </thead>
                <tbody>
                  {workerReports.length === 0
                    ? <tr><td colSpan="6" style={{textAlign:"center"}}>{t.noReport}</td></tr>
                    : workerReports.map(r => (
                        <tr key={r.id}>
                          <td>{r.date}</td>
                          <td><span className="cat-badge">{translateCategory(r.category, lang)}</span></td>
                          <td>{r.location}</td>
                          <td style={{maxWidth:"260px"}}>{r.description}</td>
                          <td>{r.people_reached}</td>
                          <td>
                            {r.images?.length > 0
                              ? <div className="thumb-grid">
                                  {r.images.map((url, i) => (
                                    <img key={i} src={mediaUrl(url)} className="thumb" alt="report"
                                      onClick={() => setPreviewImage(mediaUrl(url))}
                                      onError={e => { e.target.style.display="none"; }}
                                      loading="lazy"
                                    />
                                  ))}
                                </div>
                              : <span className="muted">{t.noImage}</span>
                            }
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {previewImage && (
          <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
            <div className="modal-img-box" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setPreviewImage(null)}><X size={18}/></button>
              <img src={previewImage} alt="Full view" className="full-img"/>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <span className="stat-label">{label}</span>
      <b className="stat-value">{value?.toLocaleString?.() ?? value}</b>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App/>);