import { useState } from 'react';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import './FAQ.css';

const FAQS = [
  { q: 'Do you provide beginner classes?',       a: 'Yes, we have beginner-friendly dance programs for all age groups. No prior experience required.' },
  { q: 'What dance styles do you teach?',         a: 'We teach Hip Hop, Contemporary, Classical, Folk, Freestyle, Jazz, and Bharatanatyam.' },
  { q: 'How can I join the academy?',             a: 'You can register easily using our Sign Up page. After creating an account, visit us or contact us to enroll in a specific course.' },
  { q: 'Do you provide weekend classes?',         a: 'Yes, weekend and evening batches are available. Check Contact Us for detailed schedules.' },
  { q: 'What is the fee structure?',              a: 'Fees vary by program and batch. Each course displays its monthly fee. Contact us for detailed pricing and special discounts.' },
  { q: 'Is there a trial class available?',       a: 'Yes, we offer a free trial class for new students. Sign up and mention it when you contact us.' },
  { q: 'What age groups do you accept?',          a: 'We accept students from age 5 and above. We have dedicated programs for children, teens, and adults.' },
  { q: 'Do you conduct annual events?',           a: 'Yes, we organize regular stage performances, annual recitals, inter-school competitions, and cultural events.' },
  { q: 'Can I switch between dance styles?',      a: 'Yes, students can switch or join multiple courses based on availability and schedule.' },
  { q: 'How do I track my attendance and fees?',  a: 'Your attendance and fee records are managed through our admin system. Contact the admin for your personal reports.' },
];

function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <>
      <PageHero title="Frequently Asked" highlight="Questions" subtitle="Everything you need to know about Dance Academy" />
      <section className="faq-section">
        <div className="faq-list">
          {FAQS.map((item, i) => (
            <div
              className={`faq-item${open === i ? ' open' : ''}`}
              key={item.q}
              onClick={() => setOpen(prev => prev === i ? null : i)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpen(prev => prev === i ? null : i)}
              role="button"
              tabIndex={0}
              aria-expanded={open === i}
            >
              <div className="faq-question">
                <span>{item.q}</span>
                <span className="faq-icon">{open === i ? '−' : '+'}</span>
              </div>
              <div className="faq-answer-wrap">
                <p className="faq-answer">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}

export default FAQ;
