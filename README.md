# oil-monitor-influx-integration

Pipes data from a ol' fashioned float gauge into an influx server via a webcam feed. Writes `fill` for a `oil_reading` measurement.

Supports InfluxDB 2.0 as that's what I'm running. Influx 1.8 also has an easy integration with Node so if you fork this you'd probably be able to update it to use that instead, it's just a different library and slightly different functions in `index.ts`.

## Configuration

Environment Variables:

- `FRAME_URL`
- `REGION_X`
- `REGION_Y`
- `REGION_H`
- `REGION_W`
- `THRESHOLD`
- `ZERO`
- `FULL`
- `UPDATE_FREQUENCY` (defaults to 60_000)
- `INFLUX_BUCKET`
- `INFLUX_ORG`
- `INFLUX_TOKEN`
- `INFLUX_URL`

## Docker

The docker build doesn't run the TypeScript compiler or copy the `src` directory, so make sure that you've ran `npm run build` first.

### Publishing instructions

```
npm run build
docker build . -t kj800x/oil-monitor-influx-integration
docker run --env-file .env -t kj800x/oil-monitor-influx-integration
docker push kj800x/oil-monitor-influx-integration
```
