import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import './Privacy.css';

const SECTIONS = [
  { title: 'Information We Collect', text: 'We collect basic user information during registration and dance academy activities including name, email, phone number and payment details.' },
  { title: 'How We Use Information', text: 'Your information is used to manage classes, communication and dance academy services. We do not sell your data to third parties.' },
  { title: 'Security',               text: 'We work to keep your personal information safe and protected using industry standard security practices.' },
  { title: 'Updates',                text: 'Our privacy policy may change when required to improve our services. We will notify users of significant changes.' },
];

function Privacy() {
  return (
    <>
      <PageHero title="Privacy" highlight="Policy" subtitle="How we collect, use and protect your information" />
      <section className="policy-section">
        <div className="policy-container">
          {SECTIONS.map(s => (
            <div className="policy-card" key={s.title}>
              <h2>{s.title}</h2>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}

export default Privacy;
