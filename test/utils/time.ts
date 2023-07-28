import timekeeper from 'timekeeper';

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let timeTravelled = 0;

export function travelTime(ms: number, permanent?: boolean) {
  if (permanent ?? true) {
    timeTravelled = timeTravelled + ms;
    timekeeper.reset();
    timekeeper.travel(Date.now() + timeTravelled);
  } else {
    timekeeper.reset();
    timekeeper.travel(Date.now() + ms);
  }
}

export const resetTimeTravelled = () => {
  timeTravelled = 0;
  timekeeper.reset();
};
