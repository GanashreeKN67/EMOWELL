import { useMemo } from "react";
import { resources } from "../../data/supportData";

const ResourcesSlider = ({ index, onPrev, onNext }) => {
  const visibleResources = useMemo(() => {
    const items = [];
    for (let offset = 0; offset < 3; offset += 1) {
      const next = resources[(index + offset) % resources.length];
      items.push({ ...next, isActive: offset === 0 });
    }
    return items;
  }, [index]);

  return (
    <section className="resources" id="resources">
      <div className="container">
        <div className="section-heading">
          <h2>Wellness Resources</h2>
          <p>
            Mix and match these supportive programmes with any of the channels
            above.
          </p>
        </div>
        <div className="slider">
          <button
            type="button"
            className="slider__control"
            onClick={onPrev}
            aria-label="Previous resource"
          >
            &lt;
          </button>
          <div className="slider__track">
            {visibleResources.map((resource) => (
              <article
                key={resource.id}
                className={`resource-card ${
                  resource.isActive ? "resource-card--active" : ""
                }`}
              >
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <a href="#support" className="text-link">
                  Explore now
                </a>
              </article>
            ))}
          </div>
          <button
            type="button"
            className="slider__control"
            onClick={onNext}
            aria-label="Next resource"
          >
            &gt;
          </button>
        </div>
      </div>
    </section>
  );
};

export default ResourcesSlider;
