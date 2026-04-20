export type EdgePrimitive =
    | 'context' // nested block with its own set of directives
    | string[] // select one of the provided string literals
    | 'string' // a simple string value
    | 'number' // a simple number value

export type EdgeSlot = {
    primitive: EdgePrimitive;
    optional?: boolean;
    label?: string;
    subSlot?: EdgeSlot;
    prefix?: string;
    suffix?: string;
};

export enum EdgeDirectiveContext {
    any = 0b1111_1111,
    events = 1 << 0,
    main = 1 << 1,
    http = 1 << 2,
    mail = 1 << 3,
    stream = 1 << 4,
    server = 1 << 5,
    location = 1 << 6,
}

export interface EdgeDirective {
    key: string;
    params: EdgeSlot[];
    context: EdgeDirectiveContext;
}

export type EdgeBlockData = [EdgeDirective['key'], ...EdgeBlockData[]];

export const EdgeDirectives: EdgeDirective[] = [
    // Core functionality
    {
        key: 'accept_mutex',
        params: [
            { primitive: ['on', 'off'] }
        ],
        context: EdgeDirectiveContext.events
    },
    {
        key: 'accept_mutex_delay',
        params: [
            { primitive: 'number', suffix: 'ms' }
        ],
        context: EdgeDirectiveContext.events
    },
    {
        key: 'daemon',
        params: [
            { primitive: ['on', 'off'] }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'debug_connection',
        params: [
            { primitive: 'string', label: 'address | CIDR | unix:' }
        ],
        context: EdgeDirectiveContext.events
    },
    {
        key: 'debug_points',
        params: [
            { primitive: ['abort', 'stop'] }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'env',
        params: [
            { primitive: 'string', subSlot: { primitive: 'string', prefix: '=' } }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'error_log',
        params: [
            { primitive: 'string', label: 'file' },
            { primitive: ['debug', 'info', 'notice', 'warn', 'error', 'crit', 'alert', 'emerg'], optional: true }
        ],
        context: EdgeDirectiveContext.main | EdgeDirectiveContext.http | EdgeDirectiveContext.mail
            | EdgeDirectiveContext.stream | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'events',
        params: [
            { primitive: 'context' }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'include',
        params: [
            { primitive: 'string', label: 'file | mask' }
        ],
        context: EdgeDirectiveContext.any
    },
    {
        key: 'load_module',
        params: [
            { primitive: 'string', label: 'file' }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'lock_file',
        params: [
            { primitive: 'string', label: 'file' }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'master_process',
        params: [
            { primitive: ['on', 'off'] }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'multi_accept',
        params: [
            { primitive: ['on', 'off'] }
        ],
        context: EdgeDirectiveContext.events
    },
    {
        key: 'pcre_jit',
        params: [
            { primitive: ['on', 'off'] }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'pid',
        params: [
            { primitive: 'string', label: 'file' }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'ssl_engine',
        params: [
            { primitive: 'string', label: 'device' }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'ssl_object_cache_inheritable',
        params: [
            { primitive: ['on', 'off'] }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'stall_threshold',
        params: [
            { primitive: 'number', suffix: 'ms' }
        ],
        context: EdgeDirectiveContext.events
    },
    {
        key: 'thread_pool',
        params: [
            { primitive: 'string', label: 'name' },
            { primitive: 'string', label: 'threads', subSlot: { primitive: 'string', label: 'number', prefix: '=' } },
            { primitive: 'string', label: 'max_queue', subSlot: { primitive: 'string', label: 'number', prefix: '=' }, optional: true }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'timer_resolution',
        params: [
            { primitive: 'number', label: 'interval', suffix: 'ms' }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'use',
        params: [
            { primitive: 'string', label: 'method' }
        ],
        context: EdgeDirectiveContext.events
    },
    {
        key: 'user',
        params: [
            { primitive: 'string', label: 'user' },
            { primitive: 'string', label: 'group', optional: true }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'worker_aio_requests',
        params: [
            { primitive: 'string', label: 'number' }
        ],
        context: EdgeDirectiveContext.events
    },
    {
        key: 'worker_connections',
        params: [
            { primitive: 'string', label: 'number' }
        ],
        context: EdgeDirectiveContext.events
    },
    {
        key: 'worker_cpu_affinity',
        params: [
            { primitive: 'string', label: 'cpumask... | auto [cpumask]' }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'worker_priority',
        params: [
            { primitive: 'string', label: 'number' }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'worker_processes',
        params: [
            { primitive: 'string', label: 'number | auto' }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'worker_rlimit_core',
        params: [
            { primitive: 'string', label: 'size' }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'worker_rlimit_nofile',
        params: [
            { primitive: 'string', label: 'number' }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'worker_shutdown_timeout',
        params: [
            { primitive: 'number', label: 'time', suffix: 'ms' }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'working_directory',
        params: [
            { primitive: 'string', label: 'directory' }
        ],
        context: EdgeDirectiveContext.main
    }
    // ngx_http_core_module
    // ngx_http_access_module
    // ngx_http_addition_module
    // ngx_http_api_module
    // ngx_http_auth_basic_module
    // ngx_http_auth_jwt_module
    // ngx_http_auth_request_module
    // ngx_http_auth_require_module
    // ngx_http_autoindex_module
    // ngx_http_browser_module
    // ngx_http_charset_module
    // ngx_http_dav_module
    // ngx_http_empty_gif_module
    // ngx_http_f4f_module
    // ngx_http_fastcgi_module
    // ngx_http_flv_module
    // ngx_http_geo_module
    // ngx_http_geoip_module
    // ngx_http_grpc_module
    // ngx_http_gunzip_module
    // ngx_http_gzip_module
    // ngx_http_gzip_static_module
    // ngx_http_headers_module
    // ngx_http_hls_module
    // ngx_http_image_filter_module
    // ngx_http_index_module
    // ngx_http_internal_redirect_module
    // ngx_http_js_module
    // ngx_http_keyval_module
    // ngx_http_limit_conn_module
    // ngx_http_limit_req_module
    // ngx_http_log_module
    // ngx_http_map_module
    // ngx_http_memcached_module
    // ngx_http_mirror_module
    // ngx_http_mp4_module
    // ngx_http_num_map_module
    // ngx_http_oidc_module
    // ngx_http_perl_module
    // ngx_http_proxy_module
    // ngx_http_proxy_protocol_vendor_module
    // ngx_http_random_index_module
    // ngx_http_realip_module
    // ngx_http_referer_module
    // ngx_http_rewrite_module
    // ngx_http_scgi_module
    // ngx_http_secure_link_module
    // ngx_http_session_log_module
    // ngx_http_slice_module
    // ngx_http_split_clients_module
    // ngx_http_ssi_module
    // ngx_http_ssl_module
    // ngx_http_status_module
    // ngx_http_stub_status_module
    // ngx_http_sub_module
    // ngx_http_tunnel_module
    // ngx_http_upstream_module
    // ngx_http_upstream_conf_module
    // ngx_http_upstream_hc_module
    // ngx_http_userid_module
    // ngx_http_uwsgi_module
    // ngx_http_v2_module
    // ngx_http_v3_module
    // ngx_http_xslt_module
    // ngx_mail_core_module
    // ngx_mail_auth_http_module
    // ngx_mail_proxy_module
    // ngx_mail_realip_module
    // ngx_mail_ssl_module
    // ngx_mail_imap_module
    // ngx_mail_pop3_module
    // ngx_mail_smtp_module
    // ngx_stream_core_module
    // ngx_stream_access_module
    // ngx_stream_geo_module
    // ngx_stream_geoip_module
    // ngx_stream_js_module
    // ngx_stream_keyval_module
    // ngx_stream_limit_conn_module
    // ngx_stream_log_module
    // ngx_stream_map_module
    // ngx_stream_mqtt_preread_module
    // ngx_stream_mqtt_filter_module
    // ngx_stream_num_map_module
    // ngx_stream_pass_module
    // ngx_stream_proxy_module
    // ngx_stream_proxy_protocol_vendor_module
    // ngx_stream_realip_module
    // ngx_stream_return_module
    // ngx_stream_set_module
    // ngx_stream_split_clients_module
    // ngx_stream_ssl_module
    // ngx_stream_ssl_preread_module
    // ngx_stream_upstream_module
    // ngx_stream_upstream_hc_module
    // ngx_stream_zone_sync_module
    // ngx_google_perftools_module
    // ngx_mgmt_module
    // ngx_http_acme_module
    // ngx_otel_module
];