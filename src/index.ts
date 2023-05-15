import Jimp from "jimp";
import { InfluxDB, Point } from "@influxdata/influxdb-client";
import { ENV } from "./env.js";
import fetch from "node-fetch";

const influx = new InfluxDB({
  url: ENV("INFLUX_URL"),
  token: ENV("INFLUX_TOKEN"),
});

const writeApi = influx.getWriteApi(ENV("INFLUX_ORG"), ENV("INFLUX_BUCKET"));

const FRAME_URL = ENV("FRAME_URL");

async function fetchFrame() {
  console.log("fetching frame");

  // fetch img from frame url and save to frame.jpg
  const response = await fetch(FRAME_URL);
  return await response.buffer();
}

// Previous
// const REGION_X = 1004;
// const REGION_Y = 300;
// const REGION_H = 437;
// const REGION_W = 34;
// const THRESHOLD = 168;

// Set these four variable to determine the initial crop region
const REGION_X = parseInt(ENV("REGION_X"), 10);
const REGION_Y = parseInt(ENV("REGION_Y"), 10);
const REGION_H = parseInt(ENV("REGION_H"), 10);
const REGION_W = parseInt(ENV("REGION_W"), 10);
// Set this threshold in pixel brightness so that only the gauge is visible
const THRESHOLD = parseInt(ENV("THRESHOLD"), 10);
// This is the y value when the tank is empty
// This value is of the pre-crop coordinate system
const ZERO = parseInt(ENV("ZERO"), 10);
// This is the y value when the tank is full
// This value is of the pre-crop coordinate system
const FULL = parseInt(ENV("FULL"), 10);
// This is the update frequency in milliseconds, it defaults to 1 minute
const UPDATE_FREQUENCY = parseInt(ENV("UPDATE_FREQUENCY", "60000"), 10);

type Rows = { [row: number]: number };

// Takes in a y value of the height of the gauge and returns a percentage of the tank fill
function averageHeightToTankFill(x: number): number {
  return x / (FULL - ZERO) - ZERO / (FULL - ZERO);
}

function weightedAverage(rows: Rows): number {
  let numerator = 0;
  let denominator = 0;

  for (const [row, brightness] of Object.entries(rows)) {
    numerator += parseInt(row, 10) * brightness;
    denominator += brightness;
  }

  return numerator / denominator;
}

async function update() {
  const buffer = await fetchFrame();
  const image = await Jimp.read(buffer);

  const rows: Rows = {};

  image.scan(REGION_X, REGION_Y, REGION_W, REGION_H, function (__x, y, idx) {
    if (!rows[y]) {
      rows[y] = 0;
    }

    // all channels will be the same cus the image is in black and white, so just use idx+0 (red)
    const brightness = this.bitmap.data[idx]!;
    if (brightness > THRESHOLD) {
      rows[y] += this.bitmap.data[idx]!;
    }
  });

  const marker = weightedAverage(rows);
  const fill = averageHeightToTankFill(marker);

  console.log(`I think the marker is at y=${marker}`);
  console.log(`The tank fill is: ${fill}`);

  const point1 = new Point("oil_reading").floatField("fill", fill);
  writeApi.writePoint(point1);
  writeApi.flush();
}

update();

setInterval(update, UPDATE_FREQUENCY);
