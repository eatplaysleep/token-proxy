import { Router } from 'itty-router';

/*
Function to set the common and necessary headers in order to handle CORS.
*/
const setCommonHeaders = async resp => {
    try {
        /*
        In order for Set-Cookie to work, the 'Access-Control-Allow-Credentials' must be set.
        */
        resp.headers.set('Access-Control-Allow-Credentials', true);
        resp.headers.append(
            'Access-Control-Allow-Headers',
            'Set-Cookie, Content-Type'
        );
        resp.headers.set('Access-Control-Allow-Origin', ORIGIN);
        resp.headers.set('Access-Control-Allow-Methods', 'OPTIONS, POST');
        /*
           CORS requires a max age in order to set credentials.
           */
        resp.headers.set('Access-Control-Max-Age', 3600);
    } catch (error) {
        throw error;
    }
};

const token = async req => {
    try {
        const url = new URL(req.url) || {};

        let response = await fetch(req, { withCredentials: true });

        if (response && response.ok) {
            let newResponse, body;

            if (req && req.method === 'POST') {
                body = (await response.json()) || {};
            }

            newResponse = new Response(JSON.stringify(body), response);

            if (body && body.access_token) {
                /*
                Sets an HttpOnly cookie for the origin's domain that expires when the access_token expires.

                The domain must be set otherwise the cookie is only usable by Okta since the /token response comes from the Okta domain.
                */
                const regex = /(?<=\.).*/,
                    domain = ORIGIN.match(regex)[0] || '';

                newResponse.headers.append(
                    'Set-Cookie',
                    `at=${body.access_token}; Secure; HttpOnly; SameSite=None; Path=/; Domain=${domain}; Max-Age=${body.expires_in}`
                );
            }

            await setCommonHeaders(newResponse);

            return newResponse;
        } else return response;
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
Okta makes an OPTIONS and POST call that both need to be captured so using router.all().
*/
router.all('*/token', async (req, res) => {
    return await token(req);
});

/*
This snippet ties our worker to the router we defined above, all incoming requests
are passed to the router where your routes are called and the response is sent.
*/
addEventListener('fetch', e => {
    e.respondWith(router.handle(e.request));
});
