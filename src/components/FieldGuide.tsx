import { fieldGuide } from '../content/fieldGuide'

export function FieldGuide() {
  return (
    <div className="guide-list">
      {fieldGuide.map((item) => (
        <article className="guide-card" key={item.title}>
          <h3>{item.title}</h3>
          <p>{item.summary}</p>
          <ul>
            {item.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}
