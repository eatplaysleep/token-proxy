# Okta PKCE Proxy

This sample proxies the Okta `/token` request in order to 'intercept' the response and set the `access_token` as an HttpOnly/Secure cookie for the application's domain.

_There are security implications when using this model as it is overriding CORS features/capabilities._ **Before utilizing this example in any sort of production environment, be sure to submit it to in-depth security review to ensure it meets your needs.**

This proxy is implemented [here](https://pkce-proxy.atko.rocks) (see source code [here](https://github.com/eatplaysleep/okta-pkce-proxy))

## Custom okta-auth-js

In order to utilize this proxy, you must either implement some custom methods to overwrite the normal `okta-auth-js` SDK or, at a minimum, implement a custom [`httpRequestClient`](https://github.com/okta/okta-auth-js#httprequestclient) that will send the appropriate `withCredentials: true` argument required by CORS in order to permit the `Set-Cookie` header in the `/token` response.

## Router

This sample uses the [`itty-router`](https://github.com/kwhitley/itty-router) package to add routing to the Cloudflare Worker, similar to an Express server.

See [this `index.js` file](https://github.com/cloudflare/worker-template-router/blob/master/index.js) for a generic template of how to use `itty-router` in a Workers script.

## Wrangler

You can use [wrangler](https://github.com/cloudflare/wrangler) to generate a new Cloudflare Workers project of your own based on this sample by running the following command from your terminal:

```
wrangler generate okta-token-proxy https://github.com/okta-dfuhriman/token-proxy
```

Before publishing your code you need to edit `wrangler.toml` file and add your own Cloudflare `account_id` and other additional variables - more information about configuring and publishing your code can be found [in the documentation](https://developers.cloudflare.com/workers/learning/getting-started#7-configure-your-project-for-deployment).

Once you are ready, you can publish your code by running the following command:

```
wrangler publish
```
