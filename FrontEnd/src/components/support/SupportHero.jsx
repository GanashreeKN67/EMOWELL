import Icon from "../common/Icon";

const SupportHero = ({ icon, eyebrow, title, description }) => (
  <section className="support-hero">
    <div className="container support-hero__inner">
      <div className="support-hero__icon">
        <Icon type={icon} />
      </div>
      <div>
        <p className="support-hero__eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  </section>
);

export default SupportHero;
