import { Link } from "react-router-dom";
import Icon from "../common/Icon";
import { supportChannels } from "../../data/supportData";

const SupportOverview = () => (
  <section className="support-overview" id="support">
    <div className="container">
      <div className="section-heading">
        <h2>Select the Support That Suits You</h2>
        <p>
          Pick the channel that feels most natural today. Our assistant adapts
          the tone and guidance to the way you choose to open up.
        </p>
      </div>
      <div className="support-overview__grid">
        {supportChannels.map((channel) => (
          <article key={channel.id} className="support-card">
            <div className="support-card__icon">
              <Icon type={channel.icon} />
            </div>
            <h3>{channel.title}</h3>
            <p>{channel.description}</p>
            <Link className="text-link" to={channel.to}>
              Go to {channel.title}
            </Link>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default SupportOverview;
