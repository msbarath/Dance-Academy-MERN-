import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import './About.css';

const CARDS = [
  { title: 'Our Mission',   text: 'To provide quality dance training in a positive and supportive environment, encouraging students of all ages to learn, grow, and enjoy every moment of their dance journey.' },
  { title: 'What We Offer', text: 'A variety of dance programs including Classical, Hip-Hop, Contemporary, Folk, and Freestyle. Our classes are designed for beginners as well as advanced learners.' },
  { title: 'Why Choose Us', text: 'Experienced instructors, friendly atmosphere, flexible schedules, and regular stage performances help our students develop both skill and confidence.' },
  { title: 'Our Vision',    text: 'To inspire every student to discover their talent and achieve their goals through dedication, creativity, and the joy of dance.' },
];

function About() {
  return (
    <>
      <PageHero title="About Our" highlight="Dance Academy" subtitle="A place where passion meets movement and talent finds its voice." />

      <section className="about-section">
        <p className="about-intro">
          Welcome to Dance Academy — where passion meets movement. We believe dance is more than learning steps. It is a way to express emotions, build confidence, stay active, and create unforgettable memories.
        </p>
        <div className="about-grid">
          {CARDS.map(card => (
            <div className="about-card" key={card.title}>
              <h2>{card.title}</h2>
              <p>{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}

export default About;
