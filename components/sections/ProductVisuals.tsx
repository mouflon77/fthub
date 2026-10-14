function Shot({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="product-art">
      <div className="livery">
        <img src={src} alt={alt} />
        <span className="livery-wash" aria-hidden="true" />
      </div>
    </div>
  );
}

export function JobsVisual() {
  return <Shot src="/work/frontiertechjobs.jpg" alt="Frontier Tech Jobs homepage" />;
}

export function HasturVisual() {
  return <Shot src="/work/hastur.png" alt="Hastur Pulse" />;
}

export function ProjectVisual({ name, tagline, image }: { name: string; tagline: string; image: string }) {
  if (image) {
    return <Shot src={image} alt={`${name} site`} />;
  }

  return (
    <div className="product-art">
      <div className="preview">
        <div className="browser" aria-hidden="true">
          <i className="dot" />
          <i className="dot" />
          <i className="dot" />
        </div>
        <div className="job-screen">
          <div className="mini-over">Frontier Tech Hub</div>
          <strong>{name}</strong>
          {tagline ? <small>{tagline}</small> : null}
        </div>
      </div>
    </div>
  );
}
