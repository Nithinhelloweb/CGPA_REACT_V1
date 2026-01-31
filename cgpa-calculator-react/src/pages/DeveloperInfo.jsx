import React, { useState, useRef, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { Link } from 'react-router-dom';
import './DeveloperInfo.css';

const DeveloperInfo = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const formRef = useRef();

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.1; // Reduced to 10%
            // Attempt autoplay
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    setIsPlaying(true);
                }).catch(error => {
                    console.error("Autoplay prevented:", error);
                    setIsPlaying(false);
                });
            }
        }
    }, []);

    const toggleMusic = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error("Audio playback failed:", error);
                        // Auto-play might be blocked.
                    });
                }
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        emailjs.sendForm(
            'service_95qirt9',
            'template_a4vapf9',
            formRef.current,
            { publicKey: 'eiysJ7N5rcnv76bsO' }
        )
            .then(
                () => {
                    console.log('SUCCESS!');
                    setIsSubmitted(true);
                    setFormData({ name: '', email: '', message: '' });
                },
                (error) => {
                    console.log('FAILED...', error.text);
                    alert("Failed to send message. Please try again.");
                }
            );
    };

    return (
        <div className="dev-portfolio-container">
            {/* Background Elements */}
            <div className="floating-shape shape-1"></div>
            <div className="floating-shape shape-2"></div>
            <div className="floating-shape shape-3"></div>

            {/* Navigation / Back Button */}
            <nav className="dev-nav">
                <Link to="/" className="back-home-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to Application
                </Link>

                <button className="music-toggle-btn" onClick={toggleMusic} aria-label="Toggle Music">
                    {isPlaying ? (
                        /* Pause Icon (Double Bar) */
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                    ) : (
                        /* Play Icon (Triangle) */
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    )}
                    {isPlaying ? " Pause Music" : " Play Music"}
                </button>
                <audio ref={audioRef} src="/images/bgmusic.mp3" loop />
            </nav>

            {/* Hero Section */}
            <section className="dev-hero">
                <div className="hero-content">
                    <div className="profile-wrapper">
                        <img
                            src="/images/sqratio.jpeg"
                            alt="NITHINPRABU V"
                            className="hero-profile-img"
                        />
                        <div className="hero-ring"></div>
                    </div>
                    <span className="hero-tagline">👋 Welcome to my Portfolio</span>
                    <h1 className="hero-name">NITHINPRABU V</h1>
                    <h2 className="hero-title">Student Web Developer & Tech Enthusiast</h2>
                    <p className="hero-desc">
                        Driven by curiosity and passion for technology, I constantly strive to learn, innovate,
                        and push myself to achieve excellence in every task.
                    </p>
                    <div className="hero-actions">
                        <a href="#contact" className="cta-button primary">Let's Connect</a>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="dev-section about-section">
                <div className="section-header">
                    <h2>About Me</h2>
                    <span className="section-subtitle">My Journey & Passion</span>
                </div>
                <div className="about-content">
                    <div className="about-text">
                        <h3>A Dedicated Learner & Creator</h3>
                        <p>
                            Hello! I am Nithinprabu V, a passionate technology enthusiast pursuing dual degrees in Computer Science and Data Science.
                            My journey in tech has been fueled by an insatiable curiosity to understand how things work and a desire to build solutions that make a difference.
                        </p>
                        <p>
                            I believe in continuous learning and embracing new challenges. Whether it's building web applications, exploring data science concepts,
                            or designing user interfaces, I approach each project with dedication and creativity.
                        </p>
                    </div>
                    <div className="about-stats">
                        <div className="stat-card">
                            <span className="stat-number">2+</span>
                            <span className="stat-label">Years Learning</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">10+</span>
                            <span className="stat-label">Projects</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">2</span>
                            <span className="stat-label">Degrees</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Education Section */}
            <section className="dev-section education-section">
                <div className="section-header">
                    <h2>Education</h2>
                    <span className="section-subtitle">Academic Background</span>
                </div>
                <div className="timeline">
                    <div className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                            <div className="edu-header">
                                <img src="/images/iitmlogo.png" alt="IIT Madras Logo" className="edu-logo" />
                                <div>
                                    <h3>BS Data Science & Programming</h3>
                                    <h4>IIT Madras</h4>
                                </div>
                            </div>
                            <p>Pursuing a comprehensive degree in Data Science and Programming from one of India's premier technical institutions. Gaining deep insights into data analysis, machine learning, and programming fundamentals.</p>
                        </div>
                    </div>
                    <div className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                            <div className="edu-header">
                                <img src="/images/logo.png" alt="Sri Shakthi Logo" className="edu-logo" />
                                <div>
                                    <h3>B.E Computer Science & Engineering</h3>
                                    <h4>Sri Shakthi Institute of Engineering & Technology</h4>
                                </div>
                            </div>
                            <p>Building a strong foundation in computer science fundamentals, software development, and engineering principles. Hands-on experience with various programming paradigms and technologies.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Skills Section */}
            <section className="dev-section skills-section">
                <div className="section-header">
                    <h2>Skills</h2>
                    <span className="section-subtitle">Technologies & Tools</span>
                </div>
                <div className="skills-grid">
                    <div className="skill-category">
                        <h3>Frontend Development</h3>
                        <div className="skill-tags">
                            <span>ReactJS</span><span>HTML5</span><span>CSS3</span>
                            <span>JavaScript</span><span>Flutter</span><span>ElectronJs</span>
                            <span>Responsive Design</span>
                        </div>
                    </div>
                    <div className="skill-category">
                        <h3>Backend Development</h3>
                        <div className="skill-tags">
                            <span>Node.js</span><span>Express.js</span><span>Flask</span><span>Django</span><span>REST APIs</span>
                        </div>
                    </div>
                    <div className="skill-category">
                        <h3>Database</h3>
                        <div className="skill-tags">
                            <span>MongoDB</span><span>DynamoDB</span><span>Azure SQL</span><span>AstraDB</span><span>Postgres SQL</span>
                        </div>
                    </div>
                    <div className="skill-category">
                        <h3>Design & Tools</h3>
                        <div className="skill-tags">
                            <span>Figma</span><span>Git</span><span>GitHub</span>
                            <span>VS Code</span><span>AntiGravity</span>
                        </div>
                    </div>
                    <div className="skill-category">
                        <h3>Languages</h3>
                        <div className="skill-tags">
                            <span>C programming</span><span>Java</span><span>Python</span>
                        </div>
                    </div>
                    <div className="skill-category">
                        <h3>Hosting Tools</h3>
                        <div className="skill-tags">
                            <span>Firebase</span><span>Vercel</span><span>Render</span>
                            <span>Netlify</span><span>GitHub Pages</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="dev-section contact-section">
                <div className="section-header">
                    <h2>Contact</h2>
                    <span className="section-subtitle">Get In Touch</span>
                </div>
                <div className="contact-wrapper">
                    <div className="contact-info">
                        <h3>Let's Connect</h3>
                        <p>I'm always excited to collaborate on new projects and ideas. Whether you have a question, want to work together, or just want to say hi, feel free to reach out!</p>

                        <div className="contact-methods">
                            <a href="mailto:nithinkvn.kvn@gmail.com" className="contact-method">
                                <div className="method-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                </div>
                                <span>Email</span>
                            </a>
                            <a href="https://www.linkedin.com/in/nithin-prabu-21b415338" target="_blank" rel="noopener noreferrer" className="contact-method">
                                <div className="method-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                                </div>
                                <span>LinkedIn Profile</span>
                            </a>
                        </div>
                    </div>

                    <div className="contact-form-wrapper">
                        {isSubmitted ? (
                            <div className="success-message">
                                <div className="success-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                </div>
                                <h3>Message Sent!</h3>
                                <p>Thank you for reaching out. I'll get back to you soon!</p>
                                <button onClick={() => setIsSubmitted(false)} className="cta-button secondary">Send Another</button>
                            </div>
                        ) : (
                            <form className="contact-form" ref={formRef} onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">Your Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Nithin"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Your Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="nithin@example.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="message">Your Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        placeholder="Hello, I'd like to talk about..."
                                        rows="4"
                                    ></textarea>
                                </div>
                                <button type="submit" className="cta-button primary full-width">
                                    Send Message ✨
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default DeveloperInfo;
