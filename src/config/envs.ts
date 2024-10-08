import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
    PORT: number;
    NATS_SERVERS: string[],
    STRIPE_SECRET: string,
    ENDPOINT_SECRET: string,
    URL_SUCCESS: string,
    URL_CANCEL: string,
}

const envsSchema = joi.object({
    PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
    STRIPE_SECRET: joi.string().required(),
    ENDPOINT_SECRET: joi.string().required(),
    URL_SUCCESS: joi.string().required(),
    URL_CANCEL: joi.string().required(),

}).
    unknown(true);


const { error, value } = envsSchema.validate({
    ...process.env,
    NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
});

if (error) {
    throw new Error(`Config validation error -> ${error.message}`)
}

const envVars: EnvVars = value;

export const envs = {
    port: envVars.PORT,
    natsServers: envVars.NATS_SERVERS,
    stripeSecret: envVars.STRIPE_SECRET,
    enpointSecret: envVars.ENDPOINT_SECRET,    
    urlSuccess: envVars.URL_SUCCESS,
    urlCancel: envVars.URL_CANCEL
}