import { Router } from 'itty-router';

/*
Function to set the common and necessary headers in order to handle CORS.
*/
const setCommonHeaders = async (resp, origin) => {
    try {
        /*
        In order for Set-Cookie to work, the 'Access-Control-Allow-Credentials' must be set.
        */
        resp.headers.set('Access-Control-Allow-Credentials', true);
        resp.headers.append(
            'Access-Control-Allow-Headers',
            'Set-Cookie, Content-Type'
        );
        resp.headers.set('Access-Control-Allow-Origin', origin || ORIGIN);
        resp.headers.set('Access-Control-Allow-Methods', 'OPTIONS, POST');
        /*
           CORS requires a max age in order to set credentials.
           */
        resp.headers.set('Access-Control-Max-Age', 3600);
    } catch (error) {
        throw error;
    }
};

const doToken = async (response, origin, method) => {
    try {
        /*
        Sets an HttpOnly cookie for the origin's domain that expires when the access_token expires.

        The domain must be set otherwise the cookie is only usable by Okta since the /token response comes from the Okta domain.
        */

        const newResponse = new Response(response.clone().body, response);

        if (method && method !== 'OPTIONS') {
            const body = (await response.json()) || undefined;

            const regex = /(?<=\.).*/;
            const _origin = origin || ORIGIN;
            const domain = _origin.match(regex)[0] || '';

            newResponse.headers.append(
                'Set-Cookie',
                `at=${body.access_token}; Secure; HttpOnly; SameSite=None; Path=/; Domain=${domain}; Max-Age=${body.expires_in}`
            );
        }

        return newResponse;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const handler = async req => {
    try {
        const { method } = req || {};

        const { origin } = Object.fromEntries(req.headers) || {};

        let response = await fetch(req, { withCredentials: true });

        if (response && response.ok) {
            const newResponse = await doToken(response.clone(), origin, method);

            await setCommonHeaders(newResponse, origin);

            return newResponse;
        }

        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Create a new router
const router = Router();

/*
Our index route, a simple hello world.
*/
router.get('/', () => {
    return new Response(
        'Hello, world! This is the root page of your Worker template.'
    );
});

/*
Okta makes an OPTIONS and POST call for /token that both need to be captured so using router.all().
*/
router.all('*', async (req, res) => {
    return await handler(req);
});

/*
This snippet ties our worker to the router we defined above, all incoming requests
are passed to the router where your routes are called and the response is sent.
*/
addEventListener('fetch', e => {
    e.respondWith(router.handle(e.request));
});
