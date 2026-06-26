import logo from "./assets/logo.jpeg";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Upload,
  Users,
  MapPin,
  FileText,
  LogOut,
  Camera,
  BarChart3,
  Lock,
  CalendarDays,
  Home,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./style.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const BAR_COLOR = "#ed1c24";

const PIE_COLORS = [
  "#ed1c24",
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#65a30d",
];

function App() {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("ss_user") || "null")
  );

  const [lang, setLang] = useState(() => localStorage.getItem("ss_lang") || "en");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [events, setEvents] = useState([]);
  const [adminEvents, setAdminEvents] = useState([]);

  const changeLanguage = (selectedLang) => {
    setLang(selectedLang);
    localStorage.setItem("ss_lang", selectedLang);
  };

  const labels = {
    en: {
      org: "Shramjeevi Sanghatna",
      subOrg: "Maharashtra Activist Reporting System",
      loginTitle: "Log in to Your Account",
      welcome: "Welcome back! Please enter your details.",
      username: "User Name",
      password: "Password",
      login: "Log In",
      logout: "Logout",
      selectLanguage: "Select Language",
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
      scoreNote:
        "Score is based on number of reports, people reached, and image proof uploaded.",
      districtProductivity: "District Productivity Dashboard",
      activistProductivity: "Activists' Performance Comparison",
      workTypeMore: "Type of Work Done Most",

      showActivistPerformance: "Activists' Performance Comparison",
      showWorkDistribution: "Type of Work Done in District",
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
      selectDate: "Select Date to View Work",
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
      openLogin: "Slide to Login",
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
      updateFailed: "Update failed"
    },

    mr: {
      org: "श्रमजीवी संघटना",
      subOrg: "महाराष्ट्र कार्यकर्ता अहवाल प्रणाली",
      loginTitle: "तुमच्या खात्यात लॉग इन करा",
      welcome: "परत स्वागत आहे! कृपया तपशील भरा.",
      username: "वापरकर्ता नाव",
      password: "पासवर्ड",
      login: "लॉग इन",
      logout: "लॉगआउट",
      selectLanguage: "भाषा निवडा",
      demoAdmin: "डेमो प्रशासक",
      demoActivist: "डेमो कार्यकर्ता",
      invalidLogin: "लॉगिन चुकीचे आहे किंवा बॅकएंड सुरू नाही",
      passwordError: "पासवर्ड किमान ६ अक्षरांचा असावा.",
      hello: "नमस्कार",
      loading: "डॅशबोर्ड लोड होत आहे...",

      adminPanel: "CEO कामगिरी डॅशबोर्ड",
      activistPanel: "दैनिक कार्यकर्ता अहवाल",

      totalReports: "एकूण अहवाल",
      totalActivists: "एकूण कार्यकर्ते",
      districts: "जिल्हे",
      peopleReached: "संपर्कित लोक",

      districtPerformance: "जिल्हानिहाय कामगिरी तुलना",
      scoreNote:
        "गुणांकन अहवालांची संख्या, संपर्कित लोक आणि अपलोड केलेल्या छायाचित्र पुराव्यावर आधारित आहे.",
      districtProductivity: "जिल्हा उत्पादकता डॅशबोर्ड",
      activistProductivity: "कार्यकर्त्यांची कामगिरी तुलना",
      workTypeMore: "सर्वाधिक झालेले कामाचे प्रकार",

      showActivistPerformance: "कार्यकर्त्यांची कामगिरी तुलना",
      showWorkDistribution: "जिल्ह्यात झालेल्या कामाचे प्रकार",
      chartInstruction: "जिल्हास्तरीय विश्लेषण पाहण्यासाठी चार्ट निवडा.",

      activistName: "कार्यकर्त्याचे नाव",
      phone: "मोबाईल क्रमांक",
      district: "जिल्हा",
      reports: "अहवाल",
      score: "गुण",
      searchActivist: "कार्यकर्त्याचे नाव शोधा...",

      dayWiseProfile: "दिवसनिहाय कार्य अहवाल",
      name: "नाव",
      totalPeopleReached: "एकूण संपर्कित लोक",
      selectDate: "काम पाहण्यासाठी दिनांक निवडा",
      showAll: "सर्व दाखवा",
      dailyOperations: "दैनंदिन कामकाज",

      date: "दिनांक",
      category: "कार्य प्रकार",
      location: "ठिकाण",
      description: "कार्याचे वर्णन",
      image: "छायाचित्र",
      noImage: "छायाचित्र नाही",
      noReport: "निवडलेल्या दिनांकासाठी कोणताही अहवाल सापडला नाही.",

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
      save: "बदल जतन करा",
      cancel: "रद्द करा",
      landingTitle: "श्रमजीवी संघटना",
      landingSubtitle: "दैनंदिन अहवाल, जिल्हानिहाय कामगिरी आणि सार्वजनिक कार्यक्रम एकाच स्पष्ट प्रणालीत.",
      openLogin: "लॉगिन करा",
      backHome: "मुख्य पानावर परत",
      events: "कार्यक्रम",
      upcomingEvents: "नवीन कार्यक्रम",
      addEvent: "कार्यक्रम जोडा",
      eventTitle: "कार्यक्रमाचे शीर्षक",
      eventAdded: "कार्यक्रम यशस्वीरित्या जोडला",
      noEvents: "अजून कोणतेही कार्यक्रम जोडलेले नाहीत.",
      eventImage: "कार्यक्रमाचे छायाचित्र",
      adminOnly: "प्रशासक नियंत्रण",
      eventTitleMr: "कार्यक्रमाचे मराठी शीर्षक",
      locationMr: "मराठी ठिकाण",
      descriptionMr: "मराठी वर्णन",
      latestEvent: "मुख्य पानावर दाखवा",
      outdatedEvent: "कालबाह्य म्हणून चिन्हांकित करा",
      status: "स्थिती",
      latest: "नवीन",
      outdated: "कालबाह्य",
      hidden: "लपवलेले",
      visible: "दृश्यमान",
      updateFailed: "बदल जतन झाले नाहीत"
    },
  }[lang];

  const eventLabels = {
    landingTitle: labels.landingTitle || "Shramjeevi Sanghatna",
    landingSubtitle:
      labels.landingSubtitle ||
      "Daily work reports, district performance, and public events in one clear system.",
    openLogin: labels.openLogin || "Slide to Login",
    backHome: labels.backHome || "Back Home",
    events: labels.events || "Events",
    upcomingEvents: labels.upcomingEvents || "Latest Events",
    addEvent: labels.addEvent || "Add Event",
    eventTitle: labels.eventTitle || "Event Title",
    eventAdded: labels.eventAdded || "Event added successfully",
    noEvents: labels.noEvents || "No events added yet.",
    eventImage: labels.eventImage || "Event Image",
    adminOnly: labels.adminOnly || "Admin controls",
  };
  const t = { ...eventLabels, ...labels };

  const loadEvents = async () => {
    try {
      const res = await axios.get(`${API}/events`);
      setEvents(res.data);
    } catch {
      setEvents([]);
    }
  };

  const loadAdminEvents = async () => {
    try {
      const res = await axios.get(`${API}/events/admin`);
      setAdminEvents(res.data);
    } catch {
      setAdminEvents([]);
    }
  };

  const refreshEvents = async () => {
    await Promise.all([loadEvents(), loadAdminEvents()]);
  };

  useEffect(() => {
    refreshEvents();
  }, []);

  const logout = () => {
    localStorage.removeItem("ss_user");
    setUser(null);
    setShowLogin(false);
    refreshEvents();
  };

  if (!user) {
    return (
        <LandingPage
          events={events}
          setUser={setUser}
          lang={lang}
          setLang={changeLanguage}
        t={t}
        showLogin={showLogin}
        setShowLogin={setShowLogin}
      />
    );
  }

  return (
    <>
      {user.role === "admin" ? (
        <AdminDashboard user={user} logout={logout} t={t} lang={lang} setLang={changeLanguage} events={adminEvents} onEventsChanged={refreshEvents} onOpenPasswordModal={() => setShowPasswordModal(true)} />
      ) : (
        <WorkerDashboard user={user} logout={logout} t={t} lang={lang} setLang={changeLanguage} onOpenPasswordModal={() => setShowPasswordModal(true)} />
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
    setError("");
    setSuccess("");
    try {
      await axios.post(`${API}/change-password`, {
        user_id: user.id,
        old_password: oldPassword,
        new_password: newPassword
      });
      setSuccess("Password updated!");
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Update failed");
    }
  };

  return (
    <div className="imageModal">
      <div className="imageModalContent" onClick={e => e.stopPropagation()} style={{maxWidth: '400px', width: '90%'}}>
        <button className="closeImageBtn" onClick={onClose}>×</button>
        <div className="panel" style={{boxShadow: 'none', marginBottom: 0}}>
          <h2><Lock size={20}/> {t.changePass}</h2>
          <form className="reportForm" onSubmit={handleUpdate}>
            <label>{t.oldPass}</label>
            <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
            <label>{t.newPass}</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
            {error && <p className="errorText">{error}</p>}
            {success && <p className="success">{success}</p>}
            <div className="chartButtonRow" style={{marginTop: '1.5rem', justifyContent: 'flex-end'}}>
              <button type="button" className="chartToggleBtn" onClick={onClose}>{t.cancel}</button>
              <button type="submit" className="chartToggleBtn activeChartBtn">{t.save}</button>
            </div>
          </form>
        </div>
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

  if (lang === "mr") {
    return (
      item.district_name_mr ||
      item.name_mr ||
      item.district_name ||
      item.name
    );
  }

  return item.district_name || item.name;
}

function translateCategory(category, lang) {
  if (lang !== "mr") return category;

  const map = {
    "Village Visit": "गाव भेट",
    "Labour Issue Resolved": "कामगार समस्या सोडवली",
    Meeting: "बैठक",
    "Awareness Campaign": "जनजागृती मोहीम",
    "Protest / Morcha": "आंदोलन / मोर्चा",
  };

  return map[category] || category;
}

function Logo() {
  return (
    <div className="logoBox">
      <img
        src={logo}
        alt="Shramjeevi Sanghatna"
        className="orgLogo"
      />
    </div>
  );
}

function mediaUrl(path) {
  if (!path) return "";
  return path.startsWith("http") ? path : `${API}${path}`;
}

function getEventText(event, field, lang) {
  if (!event) return "";
  if (lang === "mr") {
    return event[`${field}_mr`] || event[field] || "";
  }
  return event[field] || event[`${field}_mr`] || "";
}

function LanguageToggle({ lang, setLang, t }) {
  return (
    <div className="languageRow compactLanguageRow">
      <span>{t.selectLanguage}</span>

      <div className="toggle">
        <button
          type="button"
          className={lang === "en" ? "active" : ""}
          onClick={() => setLang("en")}
        >
          Eng
        </button>

        <button
          type="button"
          className={lang === "mr" ? "active" : ""}
          onClick={() => setLang("mr")}
        >
          मराठी
        </button>
      </div>
    </div>
  );
}

function LandingPage({ events, setUser, lang, setLang, t, showLogin, setShowLogin }) {
  return (
    <main className={`landingShell ${showLogin ? "loginOpen" : ""}`}>
      <nav className="landingNav">
        <div className="brand">
          <Logo />
          <div className="brandText">
            <b>{t.org}</b>
            <span>{t.subOrg}</span>
          </div>
        </div>

        <button className="ghostBtn" onClick={() => setShowLogin(true)}>
          <Lock size={16} />
          {t.openLogin}
        </button>

        <LanguageToggle lang={lang} setLang={setLang} t={t} />
      </nav>

      <section className="landingHero">
        <div className="heroCopy">
          <p className="eyebrow">{t.events}</p>
          <h1>{t.landingTitle}</h1>
          <p>{t.landingSubtitle}</p>
          <button className="slideLoginBtn" onClick={() => setShowLogin(true)}>
            <span>{t.openLogin}</span>
            <Lock size={18} />
          </button>
        </div>

        <div className="heroShowcase">
          <Logo />
          <div>
            <span>{t.upcomingEvents}</span>
            <b>{events.length}</b>
          </div>
        </div>
      </section>

      <section className="eventsSection">
        <div className="sectionTitle">
          <CalendarDays size={22} />
          <h2>{t.upcomingEvents}</h2>
        </div>
        <EventSlider events={events} t={t} lang={lang} />
      </section>

      <div className="loginSlider" aria-hidden={!showLogin}>
        <button className="backHomeBtn" onClick={() => setShowLogin(false)}>
          <Home size={16} />
          {t.backHome}
        </button>
        <Login setUser={setUser} lang={lang} setLang={setLang} t={t} compact />
      </div>
    </main>
  );
}

function EventSlider({ events, t, lang }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (events.length <= 1) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % events.length);
    }, 4200);

    return () => clearInterval(timer);
  }, [events.length]);

  useEffect(() => {
    if (activeIndex > events.length - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, events.length]);

  if (!events.length) {
    return <div className="emptyEvents">{t.noEvents}</div>;
  }

  const moveSlide = (direction) => {
    setActiveIndex((current) => {
      if (direction === "next") return (current + 1) % events.length;
      return (current - 1 + events.length) % events.length;
    });
  };

  return (
    <div className="eventSlider">
      <div className="eventSliderTrack">
        {events.map((event, index) => (
          <article
            className={`eventSlide ${index === activeIndex ? "activeSlide" : ""}`}
            key={event.id}
            aria-hidden={index !== activeIndex}
          >
            <div className="eventSlideImage">
              {event.image_url ? (
                <img src={mediaUrl(event.image_url)} alt={getEventText(event, "title", lang)} />
              ) : (
                <CalendarDays size={46} />
              )}
            </div>

            <div className="eventSlideBody">
              <span className="eventDate">{event.date}</span>
              <h3>{getEventText(event, "title", lang)}</h3>
              <p className="eventLocation">
                <MapPin size={15} />
                {getEventText(event, "location", lang)}
              </p>
              <p>{getEventText(event, "description", lang)}</p>
            </div>
          </article>
        ))}
      </div>

      {events.length > 1 && (
        <div className="sliderControls">
          <button type="button" className="sliderArrow" onClick={() => moveSlide("prev")} aria-label="Previous event">
            <ChevronLeft size={18} />
          </button>

          <div className="sliderDots">
            {events.map((event, index) => (
              <button
                type="button"
                key={event.id}
                className={index === activeIndex ? "activeDot" : ""}
                onClick={() => setActiveIndex(index)}
                aria-label={`Show event ${index + 1}`}
              />
            ))}
          </div>

          <button type="button" className="sliderArrow" onClick={() => moveSlide("next")} aria-label="Next event">
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

function EventGrid({ events, t, lang, user, onEventsChanged }) {
  if (!events.length) {
    return <div className="emptyEvents">{t.noEvents}</div>;
  }

  return (
    <div className="eventGrid">
      {events.map((event) => (
        <article className="eventCard" key={event.id}>
          <div className="eventImage">
            {event.image_url ? (
              <img src={mediaUrl(event.image_url)} alt={getEventText(event, "title", lang)} />
            ) : (
              <CalendarDays size={44} />
            )}
          </div>
          <div className="eventBody">
            <span className="eventDate">{event.date}</span>
            <h3>{getEventText(event, "title", lang)}</h3>
            <p className="eventLocation">
              <MapPin size={15} />
              {getEventText(event, "location", lang)}
            </p>
            <p>{getEventText(event, "description", lang)}</p>
            <EventStatusControls event={event} t={t} user={user} onEventsChanged={onEventsChanged} />
          </div>
        </article>
      ))}
    </div>
  );
}

function EventStatusControls({ event, t, user, onEventsChanged }) {
  if (!user || !onEventsChanged) return null;

  const updateStatus = async (updates) => {
    try {
      await axios.patch(`${API}/events/${event.id}`, {
        admin_id: user.id,
        ...updates,
      });
      onEventsChanged();
    } catch {
      alert(t.updateFailed);
    }
  };

  const isVisible = event.is_latest && !event.is_outdated;

  return (
    <div className="eventStatusBox">
      <span className={`statusPill ${isVisible ? "statusVisible" : "statusHidden"}`}>
        {isVisible ? t.visible : t.hidden}
      </span>

      <label className="checkRow">
        <input
          type="checkbox"
          checked={Boolean(event.is_latest)}
          onChange={(e) => updateStatus({ is_latest: e.target.checked })}
        />
        {t.latestEvent}
      </label>

      <label className="checkRow">
        <input
          type="checkbox"
          checked={Boolean(event.is_outdated)}
          onChange={(e) => updateStatus({ is_outdated: e.target.checked })}
        />
        {t.outdatedEvent}
      </label>
    </div>
  );
}

function EventForm({ user, t, onEventsChanged }) {
  const [form, setForm] = useState({
    title: "",
    title_mr: "",
    date: new Date().toISOString().slice(0, 10),
    location: "",
    location_mr: "",
    description: "",
    description_mr: "",
    is_latest: true,
    is_outdated: false,
  });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const submitEvent = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("admin_id", user.id);
    Object.entries(form).forEach(([key, value]) => fd.append(key, value));
    if (image) fd.append("image", image);

    await axios.post(`${API}/events`, fd);
    setMessage(t.eventAdded);
    setForm({
      title: "",
      title_mr: "",
      date: new Date().toISOString().slice(0, 10),
      location: "",
      location_mr: "",
      description: "",
      description_mr: "",
      is_latest: true,
      is_outdated: false,
    });
    setImage(null);
    onEventsChanged();
  };

  return (
    <div className="panel eventAdminPanel">
      <h2>
        <PlusCircle size={20} />
        {t.addEvent}
      </h2>
      <form className="reportForm" onSubmit={submitEvent}>
        <label>{t.eventTitle}</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />

        <label>{t.eventTitleMr}</label>
        <input value={form.title_mr} onChange={(e) => setForm({ ...form, title_mr: e.target.value })} />

        <label>{t.date}</label>
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />

        <label>{t.location}</label>
        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />

        <label>{t.locationMr}</label>
        <input value={form.location_mr} onChange={(e) => setForm({ ...form, location_mr: e.target.value })} />

        <label>{t.description}</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />

        <label>{t.descriptionMr}</label>
        <textarea value={form.description_mr} onChange={(e) => setForm({ ...form, description_mr: e.target.value })} />

        <label>{t.eventImage}</label>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />

        <label className="checkRow">
          <input
            type="checkbox"
            checked={form.is_latest}
            onChange={(e) => setForm({ ...form, is_latest: e.target.checked })}
          />
          {t.latestEvent}
        </label>

        <label className="checkRow">
          <input
            type="checkbox"
            checked={form.is_outdated}
            onChange={(e) => setForm({ ...form, is_outdated: e.target.checked })}
          />
          {t.outdatedEvent}
        </label>

        <button className="primaryBtn">
          <PlusCircle size={18} />
          {t.addEvent}
        </button>
        {message && <p className="success">{message}</p>}
      </form>
    </div>
  );
}

function Login({ setUser, lang, setLang, t }) {
  const [phone, setPhone] = useState("8329405166");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${API}/login`, { phone, password });
      localStorage.setItem("ss_user", JSON.stringify(res.data));
      setUser(res.data);
    } catch {
      setError(t.invalidLogin);
    }
  };

  return (
    <main className="loginPage">
      <form className="loginCard" onSubmit={login}>
        <Logo />

        <h2 className="orgName">{t.org}</h2>
        <h1>{t.loginTitle}</h1>
        <p className="muted">{t.welcome}</p>

        <label>{t.username}</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />

        <label>{t.password}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {password.length < 6 && (
          <p className="errorText">{t.passwordError}</p>
        )}

        {error && <div className="alert">{error}</div>}

        <LanguageToggle lang={lang} setLang={setLang} t={t} />
  
          <button className="primaryBtn">{t.login}</button>
  
          <p className="hint">
            {t.demoAdmin}: 9999999999 / 123456
            <br />
            {t.demoActivist}: 8329405166 / 123456
          </p>
        </form>
      </main>
    );
  }
  
  function Header({ title, logout, t, lang, setLang, onOpenPasswordModal }) {
    return (
      <header className="topbar">
        <div className="brand">
          <Logo />
  
          <div className="brandText">
            <b>{t.org}</b>
            <span>{t.subOrg}</span>
          </div>
        </div>
  
        <h2 className="headerTitle">{title}</h2>
  
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap'}}>
          <LanguageToggle lang={lang} setLang={setLang} t={t} />
          <button className="ghostBtn" onClick={onOpenPasswordModal}>
            <Lock size={16} />
            {t.changePass}
          </button>
          <button className="ghostBtn" onClick={logout}>
            <LogOut size={16} />
            {t.logout}
          </button>
        </div>
      </header>
    );
  }
  
  function WorkerDashboard({ user, logout, t, lang, setLang, onOpenPasswordModal }) {
    const [form, setForm] = useState({
      date: new Date().toISOString().slice(0, 10),
      category: "",
      location: "",
      description: "",
      people_reached: 0,
    });
  
    const [images, setImages] = useState([]);
    const [msg, setMsg] = useState("");
  
    const submit = async (e) => {
      e.preventDefault();
  
      const fd = new FormData();
  
      Object.entries(form).forEach(([key, value]) => {
        fd.append(key, value);
      });
  
      fd.append("worker_id", user.id);
  
      images.forEach((image) => {
        fd.append("images", image);
      });
  
      await axios.post(`${API}/reports`, fd);
  
      setMsg(t.reportSubmitted);
  
      setForm({
        ...form,
        category: "",
        location: "",
        description: "",
        people_reached: 0,
      });
  
      setImages([]);
    };
  
    const addImages = (e) => {
      const selectedFiles = Array.from(e.target.files);
  
      setImages((previousImages) => [
        ...previousImages,
        ...selectedFiles,
      ]);
  
      e.target.value = "";
    };
  
    const removeImage = (indexToRemove) => {
      setImages((previousImages) =>
        previousImages.filter((_, index) => index !== indexToRemove)
      );
    };
  
    return (
      <>
        <Header title={t.activistPanel} logout={logout} t={t} lang={lang} setLang={setLang} onOpenPasswordModal={onOpenPasswordModal} />
  
        <section className="page">
          <div className="panel">
            <h2>
              {t.hello}, {getName(user, lang)}
            </h2>
  
            <p className="muted">
              {t.district}: {getDistrictName(user, lang)}
            </p>
  
            <form className="reportForm" onSubmit={submit}>
              <label>{t.date}</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
                required
              />
  
              <label>{t.category}</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                required
              >
                <option value="">{t.select}</option>
                <option value="Village Visit">{t.villageVisit}</option>
                <option value="Labour Issue Resolved">{t.labourIssue}</option>
                <option value="Meeting">{t.meeting}</option>
                <option value="Awareness Campaign">{t.awareness}</option>
                <option value="Protest / Morcha">{t.protest}</option>
              </select>
  
              <label>{t.location}</label>
              <input
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
                required
              />
  
              <label>{t.description}</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
              />
  
              <label>{t.peopleReached}</label>
              <input
                type="number"
                value={form.people_reached}
                onChange={(e) =>
                  setForm({ ...form, people_reached: e.target.value })
                }
              />
  
              <label className="fileLabel">
                <Camera size={18} /> {t.uploadImage}
              </label>
  
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={addImages}
              />
  
              {images.length > 0 && (
                <div className="selectedImageBox">
                  <p className="muted">
                    {t.selectedImages}: {images.length}
                  </p>
  
                  <div className="selectedImageGrid">
                    {images.map((image, index) => (
                      <div
                        className="selectedImageItem"
                        key={`${image.name}-${index}`}
                      >
                        <span>{image.name}</span>
  
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
  
              <button className="primaryBtn">
                <Upload size={18} /> {t.submit}
              </button>
  
              {msg && <p className="success">{msg}</p>}
            </form>
          </div>
        </section>
      </>
    );
  }
  
  function AdminDashboard({ user, logout, t, lang, setLang, events, onEventsChanged, onOpenPasswordModal }) {
    const [data, setData] = useState(null);
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [activeDistrictChart, setActiveDistrictChart] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
  
    useEffect(() => {
      axios.get(`${API}/dashboard`).then((res) => setData(res.data));
      axios.get(`${API}/districts`).then((res) => setDistricts(res.data));
    }, []);
  
    const openDistrict = (district) => {
      const dashboardDistrict = data.districts.find(
        (d) => d.id === district.id
      );
  
      setSelectedDistrict({
        ...district,
        dashboard: dashboardDistrict,
      });
  
      setSelectedWorker(null);
      setSearchTerm("");
      setSelectedDate("");
      setActiveDistrictChart(null);
    };
  
    const openWorker = async (workerId) => {
      const res = await axios.get(`${API}/workers/${workerId}`);
      setSelectedWorker(res.data);
      setSelectedDate("");
    };
  
    if (!data) {
      return <p className="loading">{t.loading}</p>;
    }
  
    const districtChartData = data.districts.map((district) => ({
      ...district,
      displayName: getName(district, lang),
    }));
  
    const filteredWorkers = selectedDistrict
      ? selectedDistrict.workers.filter((worker) => {
          const searchableName = `${worker.name} ${worker.name_mr}`.toLowerCase();
          return searchableName.includes(searchTerm.toLowerCase());
        })
      : [];
  
    const workerReports = selectedWorker
      ? selectedWorker.reports.filter((report) =>
          selectedDate ? report.date === selectedDate : true
        )
      : [];
  
    const workerChartData = (selectedDistrict?.dashboard?.workers || []).map(
      (worker) => ({
        ...worker,
        displayName: getName(worker, lang),
      })
    );
  
    const categoryData = (selectedDistrict?.dashboard?.category_data || []).map(
      (item) => ({
        ...item,
        name: translateCategory(item.name, lang),
      })
    );
  
    const workerChartHeight = Math.max(380, workerChartData.length * 48);
  
    return (
      <>
        <Header title={t.adminPanel} logout={logout} t={t} lang={lang} setLang={setLang} onOpenPasswordModal={onOpenPasswordModal} />
  
        <section className="page">
          <div className="adminEventGrid">
            <EventForm user={user} t={t} onEventsChanged={onEventsChanged} />

            <div className="panel publicPreviewPanel">
              <h2>
                <CalendarDays size={20} />
                {t.upcomingEvents}
              </h2>
              <EventGrid events={events} t={t} lang={lang} user={user} onEventsChanged={onEventsChanged} />
            </div>
          </div>

          <div className="statsGrid">
            <Stat
              icon={<FileText />}
              label={t.totalReports}
              value={data.summary.total_reports}
            />
  
            <Stat
              icon={<Users />}
              label={t.totalActivists}
              value={data.summary.total_workers}
            />
  
            <Stat
              icon={<MapPin />}
              label={t.districts}
              value={data.summary.total_districts}
            />
  
            <Stat
              icon={<BarChart3 />}
              label={t.peopleReached}
              value={data.summary.people_reached}
            />
          </div>
  
          <div className="panel">
            <h2>{t.districtPerformance}</h2>
            <p className="scoreNote">{t.scoreNote}</p>
  
            <ResponsiveContainer width="100%" height={360}>
              <BarChart
                data={districtChartData}
                margin={{ top: 20, right: 20, left: 10, bottom: 60 }}
              >
                <XAxis
                  dataKey="displayName"
                  interval={0}
                  tick={{ fontSize: 14 }}
                  tickMargin={10}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 14 }} />
                <Tooltip />
                <Bar
                  dataKey="score"
                  fill={BAR_COLOR}
                  radius={[8, 8, 0, 0]}
                  barSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
  
          <div className="panel">
            <h2>{t.districts}</h2>
  
            <div className="districtCards">
              {districts.map((district) => (
                <button
                  key={district.id}
                  className={
                    selectedDistrict?.id === district.id
                      ? "districtCard activeDistrict"
                      : "districtCard"
                  }
                  onClick={() => openDistrict(district)}
                >
                  <h3>{getName(district, lang)}</h3>
  
                  <p>
                    {district.workers.length} {t.totalActivists}
                  </p>
                </button>
              ))}
            </div>
          </div>
  
          {selectedDistrict && (
            <>
              <div className="panel">
                <h2>
                  {getName(selectedDistrict, lang)} - {t.districtProductivity}
                </h2>
  
                <p className="scoreNote">{t.chartInstruction}</p>
  
                <div className="chartButtonRow">
                  <button
                    className={
                      activeDistrictChart === "performance"
                        ? "chartToggleBtn activeChartBtn"
                        : "chartToggleBtn"
                    }
                    onClick={() => setActiveDistrictChart("performance")}
                  >
                    {t.showActivistPerformance}
                  </button>
  
                  <button
                    className={
                      activeDistrictChart === "workType"
                        ? "chartToggleBtn activeChartBtn"
                        : "chartToggleBtn"
                    }
                    onClick={() => setActiveDistrictChart("workType")}
                  >
                    {t.showWorkDistribution}
                  </button>
                </div>
  
                {activeDistrictChart === "performance" && (
                  <div className="chartBox">
                    <h3>{t.showActivistPerformance}</h3>
  
                    <ResponsiveContainer width="100%" height={workerChartHeight}>
                      <BarChart
                        data={workerChartData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                      >
                        <XAxis
                          type="number"
                          allowDecimals={false}
                          tick={{ fontSize: 14 }}
                        />
  
                        <YAxis
                          type="category"
                          dataKey="displayName"
                          width={150}
                          interval={0}
                          tick={{ fontSize: 14 }}
                        />
  
                        <Tooltip />
  
                        <Bar
                          dataKey="score"
                          fill={BAR_COLOR}
                          radius={[0, 8, 8, 0]}
                          barSize={28}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
  
                {activeDistrictChart === "workType" && (
                  <div className="chartBox">
                    <h3>{t.showWorkDistribution}</h3>
  
                    {categoryData.length === 0 ? (
                      <p className="muted">{t.noReport}</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={420}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={130}
                            innerRadius={55}
                            paddingAngle={4}
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell
                                key={index}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                              />
                            ))}
                          </Pie>
  
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}
              </div>
  
              <div className="panel">
                <h2>
                  {getName(selectedDistrict, lang)} - {t.totalActivists}
                </h2>
  
                <input
                  className="searchInput"
                  placeholder={t.searchActivist}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{marginBottom: '1rem'}}
                />
  
                <table>
                  <thead>
                    <tr>
                      <th>{t.activistName}</th>
                      <th>{t.phone}</th>
                      <th>{t.district}</th>
                      <th>{t.reports}</th>
                      <th>{t.peopleReached}</th>
                      <th>{t.score}</th>
                    </tr>
                  </thead>
  
                  <tbody>
                    {filteredWorkers.map((worker) => {
                      const perf = selectedDistrict.dashboard?.workers.find(
                        (w) => w.id === worker.id
                      );
  
                      return (
                        <tr key={worker.id}>
                          <td>
                            <button
                              className="nameBtn"
                              onClick={() => openWorker(worker.id)}
                            >
                              {getName(worker, lang)}
                            </button>
                          </td>
  
                          <td>{worker.phone}</td>
                          <td>{getDistrictName(worker, lang)}</td>
                          <td>{perf?.reports || 0}</td>
                          <td>{perf?.people_reached || 0}</td>
                          <td>{perf?.score || 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
  
          {selectedWorker && (
            <div className="panel">
              <h2>
                {getName(selectedWorker, lang)} - {t.dayWiseProfile}
              </h2>
  
              <div className="profileGrid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem'}}>
                <div>
                  <b>{t.name}:</b> {getName(selectedWorker, lang)}
                </div>
  
                <div>
                  <b>{t.phone}:</b> {selectedWorker.phone}
                </div>
  
                <div>
                  <b>{t.district}:</b>{" "}
                  {getDistrictName(selectedWorker, lang)}
                </div>
  
                <div>
                  <b>{t.totalReports}:</b> {selectedWorker.total_reports}
                </div>
  
                <div>
                  <b>{t.totalPeopleReached}:</b>{" "}
                  {selectedWorker.total_people_reached}
                </div>
              </div>
  
              <div className="calendarFilter" style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem'}}>
                <label>{t.selectDate}:</label>
  
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{width: 'auto'}}
                />
  
                {selectedDate && (
                  <button
                    className="chartToggleBtn"
                    onClick={() => setSelectedDate("")}
                  >
                    {t.showAll}
                  </button>
                )}
              </div>
  
              <h3>{t.dailyOperations}</h3>
  
              <table>
                <thead>
                  <tr>
                    <th>{t.date}</th>
                    <th>{t.category}</th>
                    <th>{t.location}</th>
                    <th>{t.description}</th>
                    <th>{t.peopleReached}</th>
                    <th>{t.image}</th>
                  </tr>
                </thead>
  
                <tbody>
                  {workerReports.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{textAlign: 'center'}}>{t.noReport}</td>
                    </tr>
                  ) : (
                    workerReports.map((report) => (
                      <tr key={report.id}>
                        <td>{report.date}</td>
                        <td>{translateCategory(report.category, lang)}</td>
                        <td>{report.location}</td>
                        <td style={{maxWidth: '300px'}}>{report.description}</td>
                        <td>{report.people_reached}</td>
  
                        <td>
                          {report.images && report.images.length > 0 ? (
                            <div className="imageThumbGrid" style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                              {report.images.map((imageUrl, index) => (
                                <img
                                  key={index}
                                  src={`${API}${imageUrl}`}
                                  className="tableImg clickableImg"
                                  alt="report"
                                  onClick={() =>
                                    setPreviewImage(`${API}${imageUrl}`)
                                  }
                                  style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', boxShadow: '2px 2px 5px #d1d9e6'}}
                                />
                              ))}
                            </div>
                          ) : (
                            t.noImage
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
  
          {previewImage && (
            <div className="imageModal" onClick={() => setPreviewImage(null)}>
              <div
                className="imageModalContent"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="closeImageBtn"
                  onClick={() => setPreviewImage(null)}
                >
                  ×
                </button>
  
                <img src={previewImage} alt="Full report" className="fullImage" />
              </div>
            </div>
          )}
        </section>
      </>
    );
  }
  
  function Stat({ icon, label, value }) {
    return (
      <div className="stat">
        {icon}
        <span>{label}</span>
        <b>{value}</b>
      </div>
    );
  }
  
  createRoot(document.getElementById("root")).render(<App />);
