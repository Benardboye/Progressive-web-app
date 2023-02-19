import pino from "pino";

const log = pino({
    transport: {
        target:"pino-pretty",
        option: {
            colorize: true
        }
    }
})

export default log