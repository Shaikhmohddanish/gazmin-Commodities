import { Photo } from "./blocks";

/**
 * A tilted wall of photographs drifting in columns (adapted from Aceternity UI's 3D
 * Marquee). Each column holds its photos twice so the loop is seamless; it runs only
 * on screen, stops with the motion switch and holds still under reduced motion.
 */
export function Marquee3D({ photos }: { photos: string[] }) {
  const columns = [0, 1, 2, 3].map((c) => photos.filter((_, i) => i % 4 === c));
  return (
    <div className="m3d" aria-hidden="true">
      <div className="m3d__plane">
        {columns.map((col, c) => (
          <div key={c} className={`m3d__col${c % 2 ? " m3d__col--rev" : ""}`}>
            {[...col, ...col].map((file, i) => (
              <div key={i} className="m3d__tile">
                <Photo file={file} sizes="(min-width: 60rem) 20rem, 45vw" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
