import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import './Terms.css';

const SECTIONS = [
  { title: 'Membership', text: 'Students must provide correct and complete information during registration. False information may result in cancellation of membership.' },
  { title: 'Class Rules', text: 'Students are expected to maintain discipline, punctuality and respect towards instructors and fellow students during all sessions.' },
  { title: 'Payments',   text: 'Fees should be paid on time to continue dance academy services. Late payments may result in temporary suspension of classes.' },
  { title: 'Changes',    text: 'The academy may update schedules, policies or services when necessary. Students will be informed of major changes in advance.' },
];

function Terms() {
  return (
    <>
      <PageHero title="Terms &" highlight="Conditions" subtitle="Please read our terms carefully before joining" />
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

export default Terms;
