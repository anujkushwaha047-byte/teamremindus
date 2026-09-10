import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, Key, ReactNode } from 'react';
import {
  Activity,
  Bell,
  Camera,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Home,
  Menu,
  Mic,
  Play,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trophy,
  Video,
  Volume2,
  X,
} from 'lucide-react';

type Reminder = {
  id: number;
  name: string;
  detail: string;
  time: string;
  type: 'medicine' | 'appointment';
  taken: boolean;
};

type SpeechRecognitionConstructor = new () => {
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

const initialReminders: Reminder[] = [
  { id: 1, name: 'Morning medicines', detail: 'After breakfast', time: '09:00 AM', type: 'medicine', taken: false },
  { id: 2, name: 'Drink some water', detail: 'Keep hydrated', time: '11:30 AM', type: 'medicine', taken: true },
  { id: 3, name: 'Physiotherapy session', detail: 'Room 204', time: '04:00 PM', type: 'appointment', taken: false },
];

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'reminders', label: 'Reminders', icon: Bell },
  { id: 'activities', label: 'Activities', icon: Activity },
  { id: 'progress', label: 'Progress', icon: Trophy },
];

function App() {
  const [activePage, setActivePage] = useState('home');
  const [showLanding, setShowLanding] = useState(true);
  const [reminders, setReminders] = useState(initialReminders);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({ name: '', time: '06:00 PM' });
  const [gameRunning, setGameRunning] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const completedCount = reminders.filter((reminder) => reminder.taken).length;
  const progress = Math.round((completedCount / reminders.length) * 100);

  useEffect(() => {
    return () => streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOpen]);

  const toggleReminder = (id: number) => {
    setReminders((current) =>
      current.map((reminder) => (reminder.id === id ? { ...reminder, taken: !reminder.taken } : reminder)),
    );
  };

  const addReminder = (event: FormEvent) => {
    event.preventDefault();
    if (!newReminder.name.trim()) return;
    setReminders((current) => [
      ...current,
      { id: Date.now(), name: newReminder.name.trim(), detail: 'Personal reminder', time: newReminder.time, type: 'medicine', taken: false },
    ]);
    setNewReminder({ name: '', time: '06:00 PM' });
    setShowAddReminder(false);
  };

  const startVoice = () => {
    const Recognition = (window as Window & { webkitSpeechRecognition?: SpeechRecognitionConstructor; SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition
      ?? (window as Window & { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;
    if (!Recognition) {
      setTranscript('Voice input is not supported in this browser.');
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'en-IN';
    recognition.onresult = (event) => setTranscript(event.results[0][0].transcript);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setTranscript('I could not hear that. Please try again.');
      setIsListening(false);
    };
    setTranscript('');
    setIsListening(true);
    recognition.start();
  };

  const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setTranscript('Camera access is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setCameraOpen(true);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setTranscript('Camera access was not allowed. You can still use the other activities.');
    }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const startGame = () => {
    setGameRunning(true);
    setGameScore((score) => score + 1);
  };

  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setShowLanding(true)} aria-label="Go to RemindUs home">
          <span className="brand-mark"><ShieldCheck size={22} /></span>
          <span><strong>Remind</strong>Us</span>
        </button>
        <div className="topbar-actions">
          <button className="icon-button" aria-label="Open notifications"><Bell size={21} /><span className="notification-dot" /></button>
          <button className="profile-button" onClick={() => setActivePage('settings')}><CircleUserRound size={26} /><span>My profile</span></button>
          <button className="mobile-menu" aria-label="Open menu"><Menu size={24} /></button>
        </div>
      </header>

      <div className="page-layout">
        <aside className="sidebar" aria-label="Main navigation">
          <div className="welcome-card">
            <span className="welcome-icon"><Sparkles size={20} /></span>
            <strong>Good morning!</strong>
            <span>Let&apos;s make today a good one.</span>
          </div>
          <nav>
            {navItems.map(({ id, label, icon: Icon }) => (
              <button key={id} className={`nav-item ${activePage === id ? 'active' : ''}`} onClick={() => setActivePage(id)}>
                <Icon size={20} /><span>{label}</span>{activePage === id && <ChevronRight size={17} className="nav-arrow" />}
              </button>
            ))}
            <button className={`nav-item ${activePage === 'settings' ? 'active' : ''}`} onClick={() => setActivePage('settings')}>
              <Settings size={20} /><span>Settings</span>
            </button>
          </nav>
          <div className="sidebar-help">
            <Stethoscope size={24} />
            <strong>Need a hand?</strong>
            <span>Your care circle can help you stay on track.</span>
            <button onClick={() => setActivePage('settings')}>Manage care circle</button>
          </div>
        </aside>

        <main className="main-content">
          {activePage === 'home' && (
            <>
              <section className="hero-row">
                <div><p className="eyebrow">Thursday, September 10, 2026</p><h1>Good morning, Anuj <span aria-hidden="true">👋</span></h1><p className="intro">Here&apos;s a calm look at your day. You&apos;re doing great.</p></div>
                <div className="today-badge"><span>Today&apos;s progress</span><strong>{progress}% complete</strong><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></div>
              </section>
              <section className="stats-grid" aria-label="Today's summary">
                <SummaryCard icon={<Bell />} label="Reminders" value={`${completedCount}/${reminders.length}`} note="completed today" color="blue" />
                <SummaryCard icon={<BrainIcon />} label="Cognitive activity" value={`${gameScore} day${gameScore === 1 ? '' : 's'}`} note="current streak" color="purple" />
                <SummaryCard icon={<Activity />} label="Wellbeing" value="Good" note="keep it up" color="green" />
              </section>
              <div className="content-grid">
                <section className="panel reminders-panel">
                  <PanelHeading title="Today&apos;s reminders" action="See all" onAction={() => setActivePage('reminders')} />
                  <div className="reminder-list">{reminders.slice(0, 3).map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} onToggle={toggleReminder} />)}</div>
                  <button className="text-button" onClick={() => setShowAddReminder(true)}><Plus size={18} /> Add a reminder</button>
                </section>
                <section className="panel activity-panel">
                  <PanelHeading title="A little brain time" action="All activities" onAction={() => setActivePage('activities')} />
                  <div className="activity-feature">
                    <div className="activity-icon"><BrainIcon /></div>
                    <div><span className="tag">Recommended for you</span><h3>Remember the picture</h3><p>A gentle 5-minute memory challenge.</p></div>
                    <button className="primary-button" onClick={startGame}>{gameRunning ? 'Played!' : 'Start activity'} <Play size={16} fill="currentColor" /></button>
                  </div>
                  {gameRunning && <p className="success-message"><Check size={16} /> Nice work! Your activity has been logged.</p>}
                </section>
              </div>
              <section className="quick-actions">
                <div><p className="eyebrow">Quick actions</p><h2>How can we help?</h2></div>
                <div className="action-buttons">
                  <button className="action-card voice" onClick={startVoice}><span><Mic /></span><strong>{isListening ? 'Listening...' : 'Talk to RemindUs'}</strong><small>Ask for help by voice</small></button>
                  <button className="action-card camera" onClick={openCamera}><span><Camera /></span><strong>Use the camera</strong><small>Try hand gestures</small></button>
                  <button className="action-card games" onClick={() => setActivePage('activities')}><span><BrainIcon /></span><strong>Brain activities</strong><small>Keep your mind active</small></button>
                </div>
              </section>
              {transcript && <div className="notice" role="status"><Volume2 size={18} /><span>{transcript}</span><button onClick={() => setTranscript('')} aria-label="Dismiss message"><X size={17} /></button></div>}
            </>
          )}
          {activePage === 'reminders' && <RemindersPage reminders={reminders} onToggle={toggleReminder} onAdd={() => setShowAddReminder(true)} />}
          {activePage === 'activities' && <ActivitiesPage gameRunning={gameRunning} gameScore={gameScore} onStart={startGame} onCamera={openCamera} />}
          {activePage === 'progress' && <ProgressPage progress={progress} completed={completedCount} total={reminders.length} score={gameScore} />}
          {activePage === 'settings' && <SettingsPage />}
        </main>
      </div>

      {showAddReminder && <div className="modal-backdrop" role="presentation"><form className="modal" onSubmit={addReminder}><div className="modal-header"><h2>Add a reminder</h2><button type="button" onClick={() => setShowAddReminder(false)} aria-label="Close"><X /></button></div><label>What should we remind you about?<input autoFocus value={newReminder.name} onChange={(event) => setNewReminder({ ...newReminder, name: event.target.value })} placeholder="For example, take vitamins" /></label><label>What time?<input type="time" value={newReminder.time} onChange={(event) => setNewReminder({ ...newReminder, time: event.target.value })} /></label><button className="primary-button" type="submit">Save reminder</button></form></div>}
      {cameraOpen && <div className="modal-backdrop"><div className="modal camera-modal"><div className="modal-header"><h2>Camera activity</h2><button onClick={closeCamera} aria-label="Close camera"><X /></button></div><video ref={videoRef} autoPlay playsInline /><p>Use your hand gestures to interact with activities.</p><button className="secondary-button" onClick={closeCamera}>Close camera</button></div></div>}
    </div>
  );
}

function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="landing-shell">
      <header className="landing-nav">
        <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
          <span className="brand-mark"><ShieldCheck size={22} /></span>
          <span><strong>Remind</strong>Us</span>
        </button>
        <nav className="landing-links" aria-label="Landing page navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#care">For care circles</a>
        </nav>
        <button className="primary-button nav-cta" onClick={onStart}>Open RemindUs <ChevronRight size={17} /></button>
      </header>

      <main>
        <section className="landing-hero">
          <div className="hero-copy">
            <div className="hero-pill"><span className="live-dot" /> Thoughtful care, made simpler</div>
            <h1>More calm in every day of care.</h1>
            <p>RemindUs brings together gentle reminders, cognitive activities, and connected support in one reassuring space for seniors and their families.</p>
            <div className="hero-actions">
              <button className="primary-button hero-button" onClick={onStart}>Get started <ChevronRight size={18} /></button>
              <a className="ghost-button" href="#how-it-works"><Play size={16} fill="currentColor" /> See how it works</a>
            </div>
            <div className="hero-proof"><span className="proof-avatars"><span>AK</span><span>RS</span><span>+</span></span><span>Designed for everyday independence</span></div>
          </div>
          <div className="hero-preview" aria-label="Preview of the RemindUs dashboard">
            <div className="preview-glow" />
            <div className="preview-window">
              <div className="preview-top"><span className="preview-brand"><span className="brand-mark"><ShieldCheck size={12} /></span> RemindUs</span><span className="preview-status"><span className="live-dot" /> Today</span></div>
              <div className="preview-heading"><span>Good morning, Anuj <span aria-hidden="true">👋</span></span><strong>33% <small>complete</small></strong></div>
              <div className="preview-progress"><span /></div>
              <div className="preview-label">Today&apos;s reminders</div>
              <div className="preview-reminder"><span className="preview-icon medicine">✚</span><span><strong>Morning medicines</strong><small>After breakfast · 09:00 AM</small></span><span className="preview-check"><Check size={14} /></span></div>
              <div className="preview-reminder"><span className="preview-icon brain">🧠</span><span><strong>Remember the picture</strong><small>5-minute brain activity</small></span><span className="preview-play"><Play size={12} fill="currentColor" /></span></div>
              <div className="preview-footer"><span><Mic size={14} /> Talk to RemindUs</span><span><Camera size={14} /> Use camera</span></div>
            </div>
          </div>
        </section>

        <section className="value-strip" aria-label="RemindUs principles">
          <div><ShieldCheck size={19} /><span><strong>Privacy-first</strong><small>Your care stays personal</small></span></div>
          <div><Volume2 size={19} /><span><strong>Voice-friendly</strong><small>Speak when it&apos;s easier</small></span></div>
          <div><Sparkles size={19} /><span><strong>Senior-friendly</strong><small>Clear, calm, and kind</small></span></div>
          <div><Activity size={19} /><span><strong>Offline-ready</strong><small>Support for real life</small></span></div>
        </section>

        <section className="landing-section process-section" id="how-it-works">
          <div className="section-intro"><p className="eyebrow">A gentler rhythm</p><h2>Support that meets people where they are.</h2><p>No complicated setup. Just the right support at the right moment.</p></div>
          <div className="process-grid"><ProcessStep number="01" title="Remember" copy="Keep important medicines, appointments, and routines close at hand." icon={<Bell />} /><ProcessStep number="02" title="Remind" copy="Receive friendly prompts that are easy to understand and act on." icon={<Clock3 />} /><ProcessStep number="03" title="Engage" copy="Build healthy habits through small, enjoyable cognitive activities." icon={<BrainIcon />} /><ProcessStep number="04" title="Connect" copy="Give trusted family members a clearer view of how to help." icon={<HeartIcon />} /></div>
        </section>

        <section className="landing-section features-section" id="features">
          <div className="section-intro centered"><p className="eyebrow">One place for everyday care</p><h2>Small moments. Meaningful support.</h2><p>Everything is designed to feel familiar, useful, and reassuring.</p></div>
          <div className="feature-grid"><FeatureCard icon={<Bell />} title="Medication reminders" copy="Make the next step clear, without making the day feel busy." accent="teal" /><FeatureCard icon={<BrainIcon />} title="Cognitive activities" copy="Gentle memory and focus activities that celebrate progress." accent="orange" /><FeatureCard icon={<Mic />} title="Voice interaction" copy="Ask for help or check in naturally with a simple voice prompt." accent="purple" /><FeatureCard icon={<ShieldCheck />} title="Care circle connection" copy="Keep family and caregivers informed without taking away independence." accent="blue" /></div>
        </section>

        <section className="care-banner" id="care"><div><p className="eyebrow">For seniors, families, and caregivers</p><h2>Care feels better when everyone feels connected.</h2><p>RemindUs helps bridge the distance between therapeutic plans and everyday life, one clear moment at a time.</p></div><button className="primary-button hero-button" onClick={onStart}>Explore the dashboard <ChevronRight size={18} /></button></section>
      </main>
      <footer className="landing-footer"><span><strong>Remind</strong>Us</span><span>Bridging the Therapeutics · SIH26003</span><button onClick={onStart}>Open app <ChevronRight size={15} /></button></footer>
    </div>
  );
}

function ProcessStep({ number, title, copy, icon }: { number: string; title: string; copy: string; icon: ReactNode }) {
  return <article className="process-step"><div className="step-top"><span>{number}</span><span className="step-icon">{icon}</span></div><h3>{title}</h3><p>{copy}</p></article>;
}

function FeatureCard({ icon, title, copy, accent }: { icon: ReactNode; title: string; copy: string; accent: string }) {
  return <article className={`feature-card ${accent}`}><span className="feature-icon">{icon}</span><h3>{title}</h3><p>{copy}</p><span className="feature-arrow"><ChevronRight size={17} /></span></article>;
}

function SummaryCard({ icon, label, value, note, color }: { icon: ReactNode; label: string; value: string; note: string; color: string }) {
  return <div className={`summary-card ${color}`}><span className="summary-icon">{icon}</span><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></div>;
}

function PanelHeading({ title, action, onAction }: { title: string; action: string; onAction: () => void }) {
  return <div className="panel-heading"><h2>{title}</h2><button className="link-button" onClick={onAction}>{action} <ChevronRight size={16} /></button></div>;
}

function ReminderCard({ reminder, onToggle }: { reminder: Reminder; onToggle: (id: number) => void; key?: Key }) {
  return <article className={`reminder-card ${reminder.taken ? 'completed' : ''}`}><span className={`reminder-type ${reminder.type}`} aria-hidden="true">{reminder.type === 'medicine' ? '✚' : <Clock3 size={20} />}</span><div className="reminder-info"><strong>{reminder.name}</strong><span>{reminder.detail}</span></div><time>{reminder.time}</time><button className={reminder.taken ? 'taken-button' : 'primary-button small'} onClick={() => onToggle(reminder.id)}>{reminder.taken ? <><Check size={16} /> Done</> : 'Mark as taken'}</button></article>;
}

function RemindersPage({ reminders, onToggle, onAdd }: { reminders: Reminder[]; onToggle: (id: number) => void; onAdd: () => void }) {
  return <PageHeader eyebrow="Your day, your pace" title="Reminders" description="Simple prompts to help you feel prepared and in control."><button className="primary-button" onClick={onAdd}><Plus size={18} /> Add reminder</button><section className="panel page-panel"><div className="reminder-list">{reminders.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} onToggle={onToggle} />)}</div></section></PageHeader>;
}

function ActivitiesPage({ gameRunning, gameScore, onStart, onCamera }: { gameRunning: boolean; gameScore: number; onStart: () => void; onCamera: () => void }) {
  return <PageHeader eyebrow="Small steps, big difference" title="Activities" description="Take a few minutes for your mind and body. There is no pressure to be perfect."><section className="activity-grid"><div className="panel activity-large"><div className="activity-icon"><BrainIcon /></div><span className="tag">Memory</span><h2>Remember the picture</h2><p>Look closely, notice the details, and see what you remember. A gentle way to exercise your memory.</p><button className="primary-button" onClick={onStart}>{gameRunning ? `Completed · ${gameScore} point${gameScore === 1 ? '' : 's'}` : 'Start activity'} <Play size={17} fill="currentColor" /></button></div><div className="panel activity-large"><div className="activity-icon camera-icon"><Video /></div><span className="tag">Movement</span><h2>Gesture play</h2><p>Use your camera and simple hand movements to interact. A caregiver can join you too.</p><button className="secondary-button" onClick={onCamera}><Camera size={17} /> Open camera</button></div></section></PageHeader>;
}

function ProgressPage({ progress, completed, total, score }: { progress: number; completed: number; total: number; score: number }) {
  return <PageHeader eyebrow="Every day counts" title="Your progress" description="Celebrate the little wins. They add up."><section className="progress-overview panel"><div className="progress-ring" style={{ '--progress': `${progress * 3.6}deg` } as CSSProperties}><div><strong>{progress}%</strong><span>today</span></div></div><div><span className="eyebrow">Today&apos;s overview</span><h2>You&apos;re building a healthy routine.</h2><p>{completed} of {total} reminders are complete, and you have a {score}-day activity streak.</p></div></section><section className="stats-grid progress-stats"><SummaryCard icon={<Check />} label="Reminders complete" value={`${completed}`} note="today" color="green" /><SummaryCard icon={<Trophy />} label="Activity streak" value={`${score}`} note="days" color="purple" /><SummaryCard icon={<HeartIcon />} label="Mood check-in" value="Good" note="last checked today" color="blue" /></section></PageHeader>;
}

function SettingsPage() {
  return <PageHeader eyebrow="Make RemindUs yours" title="Settings" description="You and your care circle are in control."><section className="panel settings-list"><div className="setting-row"><span className="setting-symbol"><CircleUserRound /></span><div><strong>My profile</strong><span>Anuj Kushwaha</span></div><ChevronRight /></div><div className="setting-row"><span className="setting-symbol"><Bell /></span><div><strong>Reminder preferences</strong><span>Sound and gentle notifications</span></div><ChevronRight /></div><div className="setting-row"><span className="setting-symbol"><ShieldCheck /></span><div><strong>Care circle</strong><span>Invite a trusted family member</span></div><ChevronRight /></div></section></PageHeader>;
}

function PageHeader({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  return <><section className="page-title"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="intro">{description}</p></div></section><div className="page-actions">{children}</div></>;
}

function BrainIcon() { return <span className="brain-icon" aria-hidden="true">🧠</span>; }
function HeartIcon() { return <span aria-hidden="true">♥</span>; }

export default App;
