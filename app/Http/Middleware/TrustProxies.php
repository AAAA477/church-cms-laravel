<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Http\Middleware\TrustProxies as Middleware;

class TrustProxies extends Middleware
{
    /**
     * The trusted proxies for this application.
     *
     * Localhost is trusted so the Next.js frontend (reverse-proxying API
     * calls) can forward the real visitor IP via X-Forwarded-For.
     *
     * @var array
     */
    protected $proxies = ['127.0.0.1', '::1'];

    /**
     * The headers that should be used to detect proxies.
     *
     * @var int
     */
    protected $headers = 15; // HEADER_X_FORWARDED_ALL
}
