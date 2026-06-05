import { useMemo } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { useStore } from "../hooks/useStore";
import "./Home.css";

const DANCE_STYLES = [
    "Hip Hop", "Classical", "Contemporary", "Folk", "Freestyle", "Jazz", "Bharatanatyam",
];

const FEATURES = [
    { title: "Expert Trainers",    text: "Learn from experienced professionals with years of performance and teaching expertise." },
    { title: "Modern Studio",      text: "Practice in a fully equipped, comfortable and creative studio environment." },
    { title: "Flexible Classes",   text: "Choose from weekday, weekend and evening batches that fit your lifestyle." },
    { title: "All Skill Levels",   text: "From beginners to advanced dancers, we have the right program for you." },
    { title: "Stage Performances", text: "Regular recitals and competitions to showcase your talent." },
    { title: "All Age Groups",     text: "Programs designed for children, teens, and adults of all backgrounds." },
];

function Home() {
    const { courses, studentCount, events } = useStore();

    const upcomingEvents = useMemo(
        () => events.filter(ev => new Date(ev.date) >= new Date(new Date().toDateString())),
        [events]
    );

    return (
        <>
            <main>
                <section className="hero">
                    <div className="hero-content">
                        <span className="hero-badge">Welcome to Dance Academy</span>
                        <h1>Move With <span className="highlight">Passion</span></h1>
                        <p>Professional dance training for all age groups and skill levels. Discover your rhythm and unleash your potential.</p>
                        <div className="hero-btns">
                            <Link to="/signup" className="hero-btn-primary">Get Started Free</Link>
                            <Link to="/about"  className="hero-btn-secondary">Learn More</Link>
                        </div>
                        {(studentCount > 0 || courses.length > 0) && (
                            <div className="hero-meta">
                                {studentCount > 0 && (
                                    <>
                                        <div className="hero-meta-item">
                                            <span className="hero-meta-num">{studentCount}</span>
                                            <span>Students</span>
                                        </div>
                                        <div className="hero-meta-divider" />
                                    </>
                                )}
                                {courses.length > 0 && (
                                    <div className="hero-meta-item">
                                        <span className="hero-meta-num">{courses.length}</span>
                                        <span>Courses</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                <section className="features">
                    <div className="section-header">
                        <h2>Why Choose Us</h2>
                        <p>Everything you need to begin your dance journey</p>
                    </div>
                    <div className="features-grid">
                        {FEATURES.map(f => (
                            <div className="feature-card" key={f.title}>
                                <h3>{f.title}</h3>
                                <p>{f.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {courses.length > 0 && (
                    <section className="courses-section">
                        <div className="section-header">
                            <h2>Our Courses</h2>
                            <p>Explore {courses.length} program{courses.length !== 1 ? "s" : ""} currently offered at the academy</p>
                        </div>
                        <div className="courses-grid">
                            {courses.map(c => (
                                <div className="course-card" key={c._id}>
                                    <div className="course-card-header">
                                        <span className="course-card-fee">&#8377;{c.fee}/mo</span>
                                    </div>
                                    <h3>{c.name}</h3>
                                    <p className="course-instructor">Instructor: {c.instructor}</p>
                                    <p className="course-schedule">Schedule: {c.schedule}</p>
                                    <Link to="/signup" className="course-enroll-btn">Enroll Now</Link>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className="styles">
                    <div className="section-header">
                        <h2>Dance Styles We Teach</h2>
                        <p>Explore a wide variety of dance forms</p>
                    </div>
                    <div className="styles-grid">
                        {DANCE_STYLES.map(name => (
                            <div className="style-card" key={name}>
                                <span>{name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {upcomingEvents.length > 0 && (
                    <section className="events-section">
                        <div className="section-header">
                            <h2>Upcoming Events</h2>
                            <p>{upcomingEvents.length} event{upcomingEvents.length !== 1 ? "s" : ""} coming up at Dance Academy</p>
                        </div>
                        <div className="events-grid">
                            {upcomingEvents.slice(0, 6).map(ev => (
                                <div className="event-card" key={ev._id}>
                                    <span className="event-type-badge">{ev.type}</span>
                                    <h3>{ev.title}</h3>
                                    <p className="event-meta">{ev.date} &bull; {ev.venue}</p>
                                    {ev.description && <p className="event-desc">{ev.description}</p>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className="cta">
                    <div className="cta-content">
                        <h2>Ready to Start Dancing?</h2>
                        <p>Join our growing community of passionate dancers at Dance Academy.</p>
                        <div className="hero-btns">
                            <Link to="/signup"  className="cta-btn-primary">Join Now — It's Free</Link>
                            <Link to="/contact" className="cta-btn-secondary">Contact Us</Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

export default Home;
