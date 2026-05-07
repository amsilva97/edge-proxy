export type EdgePrimitive =
    | 'context' // nested block with its own set of directives
    | string[] // select one of the provided string literals
    | 'string' // a simple string value
    | 'number' // a simple number value
    | 'flag'   // keyword flag — present (checked) or absent, no value
    // Non-directive primitives
    | 'ssl' // will use the apps saved ssl
    | 'snippet' // will use the apps saved snippets
    | 'role' // will use the apps saved roles for basic auth

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
    upstream = 1 << 7,
}

export interface EdgeDirective {
    module: string;
    key: string;
    params: EdgeSlot[];
    context: EdgeDirectiveContext;
}

export type EdgeBlockData = [EdgeDirective['key'], ...EdgeBlockData[]];

export const EdgeDirectives: EdgeDirective[] = [
    // Core functionality
    {
        module: 'core_functionality',
        key: 'accept_mutex',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.events
    },
    {
        module: 'core_functionality',
        key: 'accept_mutex_delay',
        params: [{ primitive: 'number', suffix: 'ms' }],
        context: EdgeDirectiveContext.events
    },
    {
        module: 'core_functionality',
        key: 'daemon',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'core_functionality',
        key: 'debug_connection',
        params: [{ primitive: 'string', label: 'address | CIDR | unix:' }],
        context: EdgeDirectiveContext.events
    },
    {
        module: 'core_functionality',
        key: 'debug_points',
        params: [{ primitive: ['abort', 'stop'] }],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'core_functionality',
        key: 'env',
        params: [{ primitive: 'string', subSlot: { primitive: 'string', prefix: '=' } }],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'core_functionality',
        key: 'error_log',
        params: [
            { primitive: 'string', label: 'file' },
            { primitive: ['debug', 'info', 'notice', 'warn', 'error', 'crit', 'alert', 'emerg'], optional: true }
        ],
        context: EdgeDirectiveContext.main | EdgeDirectiveContext.http | EdgeDirectiveContext.mail
            | EdgeDirectiveContext.stream | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'core_functionality',
        key: 'events',
        params: [{ primitive: 'context' }],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'core_functionality',
        key: 'include',
        params: [{ primitive: 'snippet' }],
        context: EdgeDirectiveContext.any
    },
    {
        module: 'core_functionality',
        key: 'load_module',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'core_functionality',
        key: 'lock_file',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'core_functionality',
        key: 'master_process',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'core_functionality',
        key: 'multi_accept',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.events
    },
    {
        module: 'core_functionality',
        key: 'pcre_jit',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'core_functionality',
        key: 'pid',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'core_functionality',
        key: 'ssl_engine',
        params: [{ primitive: 'string', label: 'device' }],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'core_functionality',
        key: 'ssl_object_cache_inheritable',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'core_functionality',
        key: 'stall_threshold',
        params: [{ primitive: 'number', suffix: 'ms' }],
        context: EdgeDirectiveContext.events
    },
    {
        module: 'core_functionality',
        key: 'thread_pool',
        params: [
            { primitive: 'string', label: 'name' },
            { primitive: 'flag', label: 'threads', subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'max_queue', subSlot: { primitive: 'number', prefix: '=' }, optional: true }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'core_functionality',
        key: 'timer_resolution',
        params: [{ primitive: 'number', label: 'interval', suffix: 'ms' }],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'core_functionality',
        key: 'use',
        params: [{ primitive: 'string', label: 'method' }],
        context: EdgeDirectiveContext.events
    },
    {
        module: 'core_functionality',
        key: 'user',
        params: [
            { primitive: 'string', label: 'user' },
            { primitive: 'string', label: 'group', optional: true }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'core_functionality',
        key: 'worker_aio_requests',
        params: [{ primitive: 'string', label: 'number' }],
        context: EdgeDirectiveContext.events
    },
    {
        module: 'core_functionality',
        key: 'worker_connections',
        params: [{ primitive: 'string', label: 'number' }],
        context: EdgeDirectiveContext.events
    },
    {
        module: 'core_functionality',
        key: 'worker_cpu_affinity',
        params: [{ primitive: 'string', label: 'cpumask... | auto [cpumask]' }],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'core_functionality',
        key: 'worker_priority',
        params: [{ primitive: 'string', label: 'number' }],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'core_functionality',
        key: 'worker_processes',
        params: [{ primitive: 'string', label: 'number | auto' }],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'core_functionality',
        key: 'worker_rlimit_core',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'core_functionality',
        key: 'worker_rlimit_nofile',
        params: [{ primitive: 'string', label: 'number' }],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'core_functionality',
        key: 'worker_shutdown_timeout',
        params: [{ primitive: 'number', label: 'time', suffix: 'ms' }],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'core_functionality',
        key: 'working_directory',
        params: [{ primitive: 'string', label: 'directory' }],
        context: EdgeDirectiveContext.main
    },
    // ngx_http_core_module
    {
        module: 'ngx_http_core_module',
        key: 'absolute_redirect',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'aio',
        params: [{ primitive: ['on', 'off', 'threads'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'aio_write',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'alias',
        params: [{ primitive: 'string', label: 'path' }],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'auth_delay',
        params: [{ primitive: 'number', suffix: 's' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'chunked_transfer_encoding',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'client_body_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'client_body_in_file_only',
        params: [{ primitive: ['on', 'clean', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'client_body_in_single_buffer',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'client_body_temp_path',
        params: [
            { primitive: 'string', label: 'path' },
            { primitive: 'number', label: 'level1', optional: true },
            { primitive: 'number', label: 'level2', optional: true },
            { primitive: 'number', label: 'level3', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'client_body_timeout',
        params: [{ primitive: 'number', suffix: 's' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'client_header_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_core_module',
        key: 'client_header_timeout',
        params: [{ primitive: 'number', suffix: 's' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_core_module',
        key: 'client_max_body_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'connection_pool_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_core_module',
        key: 'default_type',
        params: [{ primitive: 'string', label: 'mime-type' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'directio',
        params: [{ primitive: 'string', label: 'size | off' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'directio_alignment',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'disable_symlinks',
        params: [
            { primitive: ['off', 'on', 'if_not_owner'] },
            { primitive: 'flag', label: 'from', optional: true, subSlot: { primitive: 'string', prefix: '=' } }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'early_hints',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'error_page',
        params: [
            { primitive: 'string', label: 'code ...' },
            { primitive: 'string', label: '[=[response]] uri' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'etag',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'http',
        params: [{ primitive: 'context' }],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'ngx_http_core_module',
        key: 'if_modified_since',
        params: [{ primitive: ['off', 'exact', 'before'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'ignore_invalid_headers',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_core_module',
        key: 'internal',
        params: [],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'keepalive_disable',
        params: [{ primitive: ['none', 'msie6', 'safari'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'keepalive_min_timeout',
        params: [{ primitive: 'number', suffix: 's' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'keepalive_requests',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'keepalive_time',
        params: [{ primitive: 'number', suffix: 'h' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'keepalive_timeout',
        params: [
            { primitive: 'number', suffix: 's' },
            { primitive: 'number', label: 'header_timeout', suffix: 's', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'large_client_header_buffers',
        params: [
            { primitive: 'number', label: 'number' },
            { primitive: 'string', label: 'size' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_core_module',
        key: 'limit_except',
        params: [
            { primitive: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'MKCOL', 'COPY', 'MOVE', 'OPTIONS', 'PROPFIND', 'PROPPATCH', 'LOCK', 'UNLOCK', 'PATCH'] },
            { primitive: 'context' }
        ],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'limit_rate',
        params: [{ primitive: 'string', label: 'rate' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'limit_rate_after',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'lingering_close',
        params: [{ primitive: ['off', 'on', 'always'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'lingering_time',
        params: [{ primitive: 'number', suffix: 's' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'lingering_timeout',
        params: [{ primitive: 'number', suffix: 's' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'listen',
        params: [
            { primitive: 'string', label: 'address[:port] | port | unix:path' },
            { primitive: 'flag', label: 'default_server', optional: true },
            { primitive: 'flag', label: 'ssl', optional: true },
            { primitive: ['http2', 'quic'], label: 'protocol', optional: true },
            { primitive: 'flag', label: 'proxy_protocol', optional: true },
            { primitive: 'flag', label: 'setfib', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'fastopen', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'backlog', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'rcvbuf', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'sndbuf', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'accept_filter', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'deferred', optional: true },
            { primitive: 'flag', label: 'bind', optional: true },
            { primitive: 'flag', label: 'ipv6only', optional: true, subSlot: { primitive: ['on', 'off'], prefix: '=' } },
            { primitive: 'flag', label: 'reuseport', optional: true },
            { primitive: 'flag', label: 'multipath', optional: true },
            { primitive: 'flag', label: 'so_keepalive', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
        ],
        context: EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_core_module',
        key: 'location',
        params: [
            { primitive: 'string', label: '[ = | ~ | ~* | ^~ ] uri' },
            { primitive: 'context' }
        ],
        context: EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'log_not_found',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'log_subrequest',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'max_headers',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_core_module',
        key: 'max_ranges',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'merge_slashes',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_core_module',
        key: 'msie_padding',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'msie_refresh',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'open_file_cache',
        params: [
            { primitive: ['off', 'max'], label: 'mode' },
            { primitive: 'flag', label: 'max', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'inactive', optional: true, subSlot: { primitive: 'number', prefix: '=', suffix: 's' } }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'open_file_cache_errors',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'open_file_cache_min_uses',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'open_file_cache_valid',
        params: [{ primitive: 'number', suffix: 's' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'output_buffers',
        params: [
            { primitive: 'number', label: 'number' },
            { primitive: 'string', label: 'size' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'port_in_redirect',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'postpone_output',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'read_ahead',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'recursive_error_pages',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'request_pool_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_core_module',
        key: 'reset_timedout_connection',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'resolver',
        params: [
            { primitive: 'string', label: 'address ...' },
            { primitive: 'flag', label: 'valid', optional: true, subSlot: { primitive: 'number', prefix: '=', suffix: 's' } },
            { primitive: 'flag', label: 'ipv4', optional: true, subSlot: { primitive: ['on', 'off'], prefix: '=' } },
            { primitive: 'flag', label: 'ipv6', optional: true, subSlot: { primitive: ['on', 'off'], prefix: '=' } },
            { primitive: 'flag', label: 'status_zone', optional: true, subSlot: { primitive: 'string', prefix: '=' } }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'resolver_timeout',
        params: [{ primitive: 'number', suffix: 's' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'root',
        params: [{ primitive: 'string', label: 'path' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'satisfy',
        params: [{ primitive: ['all', 'any'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'send_lowat',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'send_timeout',
        params: [{ primitive: 'number', suffix: 's' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'sendfile',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'sendfile_max_chunk',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'server',
        params: [{ primitive: 'context' }],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_core_module',
        key: 'server_name',
        params: [{ primitive: 'string', label: 'name ...' }],
        context: EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_core_module',
        key: 'server_name_in_redirect',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'server_names_hash_bucket_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_core_module',
        key: 'server_names_hash_max_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_core_module',
        key: 'server_tokens',
        params: [{ primitive: ['on', 'off', 'build'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'subrequest_output_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'tcp_nodelay',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'tcp_nopush',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'try_files',
        params: [{ primitive: 'string', label: 'file ... uri | =code' }],
        context: EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'types',
        params: [{ primitive: 'context' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'types_hash_bucket_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'types_hash_max_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_core_module',
        key: 'underscores_in_headers',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_core_module',
        key: 'variables_hash_bucket_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_core_module',
        key: 'variables_hash_max_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http
    },
    // ngx_http_rewrite_module
    {
        module: 'ngx_http_rewrite_module',
        key: 'break',
        params: [],
        context: EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_rewrite_module',
        key: 'if',
        params: [
            { primitive: 'string', label: 'condition' },
            { primitive: 'context' }
        ],
        context: EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_rewrite_module',
        key: 'return',
        params: [
            { primitive: 'string', label: 'code | URL' },
            { primitive: 'string', label: 'text | URL', optional: true }
        ],
        context: EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_rewrite_module',
        key: 'rewrite',
        params: [
            { primitive: 'string', label: 'regex' },
            { primitive: 'string', label: 'replacement' },
            { primitive: ['last', 'break', 'redirect', 'permanent'], optional: true }
        ],
        context: EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_rewrite_module',
        key: 'rewrite_log',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_rewrite_module',
        key: 'set',
        params: [
            { primitive: 'string', label: '$variable' },
            { primitive: 'string', label: 'value' }
        ],
        context: EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_rewrite_module',
        key: 'uninitialized_variable_warn',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_ssl_module
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_certificate',
        params: [{ primitive: 'ssl' }], //[{ primitive: 'string', label: 'file' }], // Overriding the params to use the user save ssls
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_certificate_cache',
        params: [
            { primitive: ['off', 'max'], label: 'mode' },
            { primitive: 'flag', label: 'max', optional: true, subSlot: { primitive: 'number', label: 'size' } },
            { primitive: 'flag', label: 'inactive', optional: true, subSlot: { primitive: 'string', label: 'time' } },
            { primitive: 'flag', label: 'valid', optional: true, subSlot: { primitive: 'string', label: 'time' } },
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_certificate_compression',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_certificate_key',
        params: [{ primitive: 'ssl' }], //[{ primitive: 'string', label: 'file' }], // Overriding the params to use the user save ssls
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_ciphers',
        params: [{ primitive: 'string', label: 'ciphers' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_client_certificate',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_conf_command',
        params: [
            { primitive: 'string', label: 'name' },
            { primitive: 'string', label: 'value' },
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_crl',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_dhparam',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_early_data',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_ecdh_curve',
        params: [{ primitive: 'string', label: 'curve' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_ech_file',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_key_log',
        params: [{ primitive: 'string', label: 'path' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_ocsp',
        params: [{ primitive: ['on', 'off', 'leaf'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_ocsp_cache',
        params: [{ primitive: 'string', label: 'off | shared:name:size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_ocsp_responder',
        params: [{ primitive: 'string', label: 'url' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_password_file',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_prefer_server_ciphers',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_protocols',
        params: [
            { primitive: 'flag', label: 'SSLv2', optional: true },
            { primitive: 'flag', label: 'SSLv3', optional: true },
            { primitive: 'flag', label: 'TLSv1', optional: true },
            { primitive: 'flag', label: 'TLSv1.1', optional: true },
            { primitive: 'flag', label: 'TLSv1.2', optional: true },
            { primitive: 'flag', label: 'TLSv1.3', optional: true },
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_reject_handshake',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_session_cache',
        params: [{ primitive: 'string', label: 'off|none|builtin[:size]|shared:name:size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_session_ticket_key',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_session_tickets',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_session_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_stapling',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_stapling_file',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_stapling_responder',
        params: [{ primitive: 'string', label: 'url' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_stapling_verify',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_trusted_certificate',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_verify_client',
        params: [{ primitive: ['on', 'off', 'optional', 'optional_no_ca'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_ssl_module',
        key: 'ssl_verify_depth',
        params: [{ primitive: 'number', label: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    // ngx_http_access_module
    {
        module: 'ngx_http_access_module',
        key: 'allow',
        params: [{ primitive: 'string', label: 'address | CIDR | unix: | all' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_access_module',
        key: 'deny',
        params: [{ primitive: 'string', label: 'address | CIDR | unix: | all' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_addition_module
    {
        module: 'ngx_http_addition_module',
        key: 'add_before_body',
        params: [{ primitive: 'string', label: 'uri' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_addition_module',
        key: 'add_after_body',
        params: [{ primitive: 'string', label: 'uri' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_addition_module',
        key: 'addition_types',
        params: [{ primitive: 'string', label: 'mime-type ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_api_module
    {
        module: 'ngx_http_api_module',
        key: 'api',
        params: [
            { primitive: 'flag', label: 'write', optional: true, subSlot: { primitive: ['on', 'off'], prefix: '=' } }
        ],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_api_module',
        key: 'status_zone',
        params: [{ primitive: 'string', label: 'zone' }],
        context: EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_auth_basic_module
    {
        module: 'ngx_http_auth_basic_module',
        key: 'auth_basic',
        params: [{ primitive: 'string', label: 'realm | off' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_auth_basic_module',
        key: 'auth_basic_user_file',
        params: [{ primitive: 'role' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_auth_jwt_module
    {
        module: 'ngx_http_auth_jwt_module',
        key: 'auth_jwt',
        params: [
            { primitive: 'string', label: 'realm | off' },
            { primitive: 'flag', label: 'token', optional: true, subSlot: { primitive: 'string', prefix: '=' } }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_auth_jwt_module',
        key: 'auth_jwt_claim_set',
        params: [
            { primitive: 'string', label: '$variable' },
            { primitive: 'string', label: 'name ...' }
        ],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_auth_jwt_module',
        key: 'auth_jwt_header_set',
        params: [
            { primitive: 'string', label: '$variable' },
            { primitive: 'string', label: 'name ...' }
        ],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_auth_jwt_module',
        key: 'auth_jwt_key_cache',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_auth_jwt_module',
        key: 'auth_jwt_key_file',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_auth_jwt_module',
        key: 'auth_jwt_key_request',
        params: [{ primitive: 'string', label: 'uri' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_auth_jwt_module',
        key: 'auth_jwt_leeway',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_auth_jwt_module',
        key: 'auth_jwt_type',
        params: [{ primitive: ['signed', 'encrypted', 'nested'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_auth_jwt_module',
        key: 'auth_jwt_require',
        params: [
            { primitive: 'string', label: '$value ...' },
            { primitive: 'flag', label: 'error', optional: true, subSlot: { primitive: ['401', '403'], prefix: '=' } }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_auth_request_module
    {
        module: 'ngx_http_auth_request_module',
        key: 'auth_request',
        params: [{ primitive: 'string', label: 'uri | off' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_auth_request_module',
        key: 'auth_request_set',
        params: [
            { primitive: 'string', label: '$variable' },
            { primitive: 'string', label: 'value' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_auth_require_module
    {
        module: 'ngx_http_auth_require_module',
        key: 'auth_require',
        params: [
            { primitive: 'string', label: '$value ...' },
            { primitive: 'flag', label: 'error', optional: true, subSlot: { primitive: ['4xx', '5xx'], prefix: '=' } }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_autoindex_module
    {
        module: 'ngx_http_autoindex_module',
        key: 'autoindex',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_autoindex_module',
        key: 'autoindex_exact_size',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_autoindex_module',
        key: 'autoindex_format',
        params: [{ primitive: ['html', 'xml', 'json', 'jsonp'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_autoindex_module',
        key: 'autoindex_localtime',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_browser_module
    {
        module: 'ngx_http_browser_module',
        key: 'ancient_browser',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_browser_module',
        key: 'ancient_browser_value',
        params: [{ primitive: 'string', label: 'string' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_browser_module',
        key: 'modern_browser',
        params: [{ primitive: 'string', label: 'browser version | unlisted' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_browser_module',
        key: 'modern_browser_value',
        params: [{ primitive: 'string', label: 'string' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_charset_module
    {
        module: 'ngx_http_charset_module',
        key: 'charset',
        params: [{ primitive: 'string', label: 'charset | off' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_charset_module',
        key: 'charset_map',
        params: [
            { primitive: 'string', label: 'charset1' },
            { primitive: 'string', label: 'charset2' },
            { primitive: 'context' }
        ],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_charset_module',
        key: 'charset_types',
        params: [{ primitive: 'string', label: 'mime-type ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_charset_module',
        key: 'override_charset',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_charset_module',
        key: 'source_charset',
        params: [{ primitive: 'string', label: 'charset' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_dav_module
    {
        module: 'ngx_http_dav_module',
        key: 'create_full_put_path',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_dav_module',
        key: 'dav_access',
        params: [{ primitive: 'string', label: 'users:permissions ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_dav_module',
        key: 'dav_methods',
        params: [{ primitive: 'string', label: 'off | method ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_dav_module',
        key: 'min_delete_depth',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_empty_gif_module
    {
        module: 'ngx_http_empty_gif_module',
        key: 'empty_gif',
        params: [],
        context: EdgeDirectiveContext.location
    },
    // ngx_http_f4f_module
    {
        module: 'ngx_http_f4f_module',
        key: 'f4f',
        params: [],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_f4f_module',
        key: 'f4f_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_fastcgi_module
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_allow_upstream',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_bind',
        params: [
            { primitive: 'string', label: 'address | off' },
            { primitive: 'flag', label: 'transparent', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_bind_dynamic',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_buffering',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_buffers',
        params: [
            { primitive: 'number', label: 'number' },
            { primitive: 'string', label: 'size' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_busy_buffers_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_cache',
        params: [{ primitive: 'string', label: 'zone | off' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_cache_background_update',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_cache_bypass',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_cache_key',
        params: [{ primitive: 'string', label: 'string' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_cache_lock',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_cache_lock_age',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_cache_lock_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_cache_max_range_offset',
        params: [{ primitive: 'number', label: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_cache_methods',
        params: [{ primitive: 'string', label: 'GET | HEAD | POST ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_cache_min_uses',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_cache_path',
        params: [
            { primitive: 'string', label: 'path' },
            { primitive: 'flag', label: 'levels', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'use_temp_path', optional: true, subSlot: { primitive: ['on', 'off'], prefix: '=' } },
            { primitive: 'flag', label: 'keys_zone', subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'inactive', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'max_size', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'min_free', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'manager_files', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'manager_sleep', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'manager_threshold', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'loader_files', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'loader_sleep', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'loader_threshold', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'purger', optional: true, subSlot: { primitive: ['on', 'off'], prefix: '=' } },
            { primitive: 'flag', label: 'purger_files', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'purger_sleep', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'purger_threshold', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
        ],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_cache_purge',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_cache_revalidate',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_cache_use_stale',
        params: [{ primitive: 'string', label: 'error | timeout | invalid_header | updating | http_500 | http_503 | http_403 | http_404 | http_429 | off ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_cache_valid',
        params: [{ primitive: 'string', label: '[code ...] time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_catch_stderr',
        params: [{ primitive: 'string', label: 'string' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_connect_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_force_ranges',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_hide_header',
        params: [{ primitive: 'string', label: 'field' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_ignore_client_abort',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_ignore_headers',
        params: [{ primitive: 'string', label: 'field ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_index',
        params: [{ primitive: 'string', label: 'name' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_intercept_errors',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_keep_conn',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_limit_rate',
        params: [{ primitive: 'string', label: 'rate' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_max_temp_file_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_next_upstream',
        params: [{ primitive: 'string', label: 'error | timeout | denied | invalid_header | http_500 | http_503 | http_403 | http_404 | http_429 | non_idempotent | off ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_next_upstream_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_next_upstream_tries',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_no_cache',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_param',
        params: [
            { primitive: 'string', label: 'parameter' },
            { primitive: 'string', label: 'value' },
            { primitive: 'flag', label: 'if_not_empty', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_pass',
        params: [{ primitive: 'string', label: 'address' }],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_pass_header',
        params: [{ primitive: 'string', label: 'field' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_pass_request_body',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_pass_request_headers',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_read_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_request_buffering',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_request_dynamic',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_send_lowat',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_send_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_socket_keepalive',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_split_path_info',
        params: [{ primitive: 'string', label: 'regex' }],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_store',
        params: [{ primitive: 'string', label: 'on | off | string' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_store_access',
        params: [{ primitive: 'string', label: 'users:permissions ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_temp_file_write_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_fastcgi_module',
        key: 'fastcgi_temp_path',
        params: [
            { primitive: 'string', label: 'path' },
            { primitive: 'number', label: 'level1', optional: true },
            { primitive: 'number', label: 'level2', optional: true },
            { primitive: 'number', label: 'level3', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_flv_module
    {
        module: 'ngx_http_flv_module',
        key: 'flv',
        params: [],
        context: EdgeDirectiveContext.location
    },
    // ngx_http_geo_module
    {
        module: 'ngx_http_geo_module',
        key: 'geo',
        params: [
            { primitive: 'string', label: '[$address] $variable' },
            { primitive: 'context' }
        ],
        context: EdgeDirectiveContext.http
    },
    // ngx_http_geoip_module
    {
        module: 'ngx_http_geoip_module',
        key: 'geoip_country',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_geoip_module',
        key: 'geoip_city',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_geoip_module',
        key: 'geoip_org',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_geoip_module',
        key: 'geoip_proxy',
        params: [{ primitive: 'string', label: 'address | CIDR' }],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_geoip_module',
        key: 'geoip_proxy_recursive',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http
    },
    // ngx_http_grpc_module
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_allow_upstream',
        params: [{ primitive: 'string', label: 'address' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_bind',
        params: [
            { primitive: 'string', label: 'address | off' },
            { primitive: 'flag', label: 'transparent', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_bind_dynamic',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_connect_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_hide_header',
        params: [{ primitive: 'string', label: 'field' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_ignore_headers',
        params: [{ primitive: 'string', label: 'field ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_intercept_errors',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_next_upstream',
        params: [{ primitive: 'string', label: 'error | timeout | denied | invalid_header | http_500 | http_502 | http_503 | http_504 | http_403 | http_404 | http_429 | non_idempotent | off ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_next_upstream_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_next_upstream_tries',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_pass',
        params: [{ primitive: 'string', label: 'address' }],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_pass_header',
        params: [{ primitive: 'string', label: 'field' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_read_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_request_dynamic',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_send_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_set_header',
        params: [
            { primitive: 'string', label: 'field' },
            { primitive: 'string', label: 'value' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_socket_keepalive',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_ssl_certificate',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_ssl_certificate_cache',
        params: [
            { primitive: ['off', 'max'], label: 'mode' },
            { primitive: 'flag', label: 'max', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'inactive', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'valid', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_ssl_certificate_key',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_ssl_ciphers',
        params: [{ primitive: 'string', label: 'ciphers' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_ssl_conf_command',
        params: [
            { primitive: 'string', label: 'name' },
            { primitive: 'string', label: 'value' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_ssl_crl',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_ssl_key_log',
        params: [{ primitive: 'string', label: 'path' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_ssl_name',
        params: [{ primitive: 'string', label: 'name' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_ssl_password_file',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_ssl_protocols',
        params: [
            { primitive: 'flag', label: 'SSLv2', optional: true },
            { primitive: 'flag', label: 'SSLv3', optional: true },
            { primitive: 'flag', label: 'TLSv1', optional: true },
            { primitive: 'flag', label: 'TLSv1.1', optional: true },
            { primitive: 'flag', label: 'TLSv1.2', optional: true },
            { primitive: 'flag', label: 'TLSv1.3', optional: true },
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_ssl_server_name',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_ssl_session_reuse',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_ssl_trusted_certificate',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_ssl_verify',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_grpc_module',
        key: 'grpc_ssl_verify_depth',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_gunzip_module
    {
        module: 'ngx_http_gunzip_module',
        key: 'gunzip',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_gunzip_module',
        key: 'gunzip_buffers',
        params: [
            { primitive: 'number', label: 'number' },
            { primitive: 'string', label: 'size' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_gzip_module
    {
        module: 'ngx_http_gzip_module',
        key: 'gzip',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_gzip_module',
        key: 'gzip_buffers',
        params: [
            { primitive: 'number', label: 'number' },
            { primitive: 'string', label: 'size' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_gzip_module',
        key: 'gzip_comp_level',
        params: [{ primitive: 'number', label: 'level' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_gzip_module',
        key: 'gzip_disable',
        params: [{ primitive: 'string', label: 'regex ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_gzip_module',
        key: 'gzip_http_version',
        params: [{ primitive: ['1.0', '1.1'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_gzip_module',
        key: 'gzip_min_length',
        params: [{ primitive: 'string', label: 'length' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_gzip_module',
        key: 'gzip_proxied',
        params: [{ primitive: 'string', label: 'off | expired | no-cache | no-store | private | no_last_modified | no_etag | auth | any ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_gzip_module',
        key: 'gzip_types',
        params: [{ primitive: 'string', label: 'mime-type ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_gzip_module',
        key: 'gzip_vary',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_gzip_static_module
    {
        module: 'ngx_http_gzip_static_module',
        key: 'gzip_static',
        params: [{ primitive: ['on', 'off', 'always'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_headers_module
    {
        module: 'ngx_http_headers_module',
        key: 'add_header',
        params: [
            { primitive: 'string', label: 'name' },
            { primitive: 'string', label: 'value' },
            { primitive: 'flag', label: 'always', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_headers_module',
        key: 'add_header_inherit',
        params: [{ primitive: ['on', 'off', 'merge'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_headers_module',
        key: 'add_trailer',
        params: [
            { primitive: 'string', label: 'name' },
            { primitive: 'string', label: 'value' },
            { primitive: 'flag', label: 'always', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_headers_module',
        key: 'add_trailer_inherit',
        params: [{ primitive: ['on', 'off', 'merge'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_headers_module',
        key: 'expires',
        params: [{ primitive: 'string', label: '[modified] time | epoch | max | off' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_hls_module
    {
        module: 'ngx_http_hls_module',
        key: 'hls',
        params: [],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_hls_module',
        key: 'hls_buffers',
        params: [
            { primitive: 'number', label: 'number' },
            { primitive: 'string', label: 'size' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_hls_module',
        key: 'hls_forward_args',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_hls_module',
        key: 'hls_fragment',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_hls_module',
        key: 'hls_mp4_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_hls_module',
        key: 'hls_mp4_max_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_image_filter_module
    {
        module: 'ngx_http_image_filter_module',
        key: 'image_filter',
        params: [{ primitive: 'string', label: 'off | test | size | rotate 90|180|270 | resize width height | crop width height' }],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_image_filter_module',
        key: 'image_filter_buffer',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_image_filter_module',
        key: 'image_filter_interlace',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_image_filter_module',
        key: 'image_filter_jpeg_quality',
        params: [{ primitive: 'number', label: 'quality' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_image_filter_module',
        key: 'image_filter_sharpen',
        params: [{ primitive: 'number', label: 'percent' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_image_filter_module',
        key: 'image_filter_transparency',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_image_filter_module',
        key: 'image_filter_webp_quality',
        params: [{ primitive: 'number', label: 'quality' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_index_module
    {
        module: 'ngx_http_index_module',
        key: 'index',
        params: [{ primitive: 'string', label: 'file ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_internal_redirect_module
    {
        module: 'ngx_http_internal_redirect_module',
        key: 'internal_redirect',
        params: [{ primitive: 'string', label: 'uri' }],
        context: EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_js_module
    {
        module: 'ngx_http_js_module',
        key: 'js_body_filter',
        params: [
            { primitive: 'string', label: 'module.function' },
            { primitive: 'flag', label: 'buffer_type', optional: true, subSlot: { primitive: ['string', 'buffer'], prefix: '=' } }
        ],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_content',
        params: [{ primitive: 'string', label: 'module.function' }],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_context_reuse',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_engine',
        params: [{ primitive: ['njs', 'qjs'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_fetch_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_fetch_ciphers',
        params: [{ primitive: 'string', label: 'ciphers' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_fetch_max_response_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_fetch_protocols',
        params: [
            { primitive: 'flag', label: 'TLSv1', optional: true },
            { primitive: 'flag', label: 'TLSv1.1', optional: true },
            { primitive: 'flag', label: 'TLSv1.2', optional: true },
            { primitive: 'flag', label: 'TLSv1.3', optional: true },
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_fetch_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_fetch_trusted_certificate',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_fetch_verify',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_fetch_verify_depth',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_fetch_proxy',
        params: [{ primitive: 'string', label: 'url' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_fetch_keepalive',
        params: [{ primitive: 'number', label: 'connections' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_fetch_keepalive_requests',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_fetch_keepalive_time',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_fetch_keepalive_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_header_filter',
        params: [{ primitive: 'string', label: 'module.function' }],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_import',
        params: [{ primitive: 'string', label: 'module.js | export_name from module.js' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_include',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_load_http_native_module',
        params: [{ primitive: 'string', label: 'path [as name]' }],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_path',
        params: [{ primitive: 'string', label: 'path' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_periodic',
        params: [
            { primitive: 'string', label: 'module.function' },
            { primitive: 'flag', label: 'interval', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'jitter', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'worker_affinity', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
        ],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_preload_object',
        params: [{ primitive: 'string', label: 'name.json | name from file.json' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_set',
        params: [
            { primitive: 'string', label: '$variable' },
            { primitive: 'string', label: 'module.function' },
            { primitive: 'flag', label: 'nocache', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_shared_dict_zone',
        params: [
            { primitive: 'flag', label: 'zone', subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'timeout', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'type', optional: true, subSlot: { primitive: ['string', 'number'], prefix: '=' } },
            { primitive: 'flag', label: 'evict', optional: true },
            { primitive: 'flag', label: 'state', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
        ],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_js_module',
        key: 'js_var',
        params: [
            { primitive: 'string', label: '$variable' },
            { primitive: 'string', label: 'value', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_keyval_module
    {
        module: 'ngx_http_keyval_module',
        key: 'keyval',
        params: [
            { primitive: 'string', label: 'key' },
            { primitive: 'string', label: '$variable' },
            { primitive: 'flag', label: 'zone', subSlot: { primitive: 'string', prefix: '=' } }
        ],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_keyval_module',
        key: 'keyval_zone',
        params: [
            { primitive: 'flag', label: 'zone', subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'state', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'timeout', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'type', optional: true, subSlot: { primitive: ['string', 'ip', 'prefix'], prefix: '=' } },
            { primitive: 'flag', label: 'sync', optional: true },
        ],
        context: EdgeDirectiveContext.http
    },
    // ngx_http_limit_conn_module
    {
        module: 'ngx_http_limit_conn_module',
        key: 'limit_conn',
        params: [
            { primitive: 'string', label: 'zone' },
            { primitive: 'number', label: 'number' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_limit_conn_module',
        key: 'limit_conn_dry_run',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_limit_conn_module',
        key: 'limit_conn_log_level',
        params: [{ primitive: ['info', 'notice', 'warn', 'error'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_limit_conn_module',
        key: 'limit_conn_status',
        params: [{ primitive: 'number', label: 'code' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_limit_conn_module',
        key: 'limit_conn_zone',
        params: [
            { primitive: 'string', label: 'key' },
            { primitive: 'flag', label: 'zone', subSlot: { primitive: 'string', prefix: '=' } }
        ],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_limit_conn_module',
        key: 'limit_zone',
        params: [
            { primitive: 'string', label: 'name' },
            { primitive: 'string', label: '$variable' },
            { primitive: 'string', label: 'size' }
        ],
        context: EdgeDirectiveContext.http
    },
    // ngx_http_limit_req_module
    {
        module: 'ngx_http_limit_req_module',
        key: 'limit_req',
        params: [
            { primitive: 'flag', label: 'zone', subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'burst', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'nodelay', optional: true },
            { primitive: 'flag', label: 'delay', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_limit_req_module',
        key: 'limit_req_dry_run',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_limit_req_module',
        key: 'limit_req_log_level',
        params: [{ primitive: ['info', 'notice', 'warn', 'error'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_limit_req_module',
        key: 'limit_req_status',
        params: [{ primitive: 'number', label: 'code' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_limit_req_module',
        key: 'limit_req_zone',
        params: [
            { primitive: 'string', label: 'key' },
            { primitive: 'flag', label: 'zone', subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'rate', subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'sync', optional: true },
        ],
        context: EdgeDirectiveContext.http
    },
    // ngx_http_log_module
    {
        module: 'ngx_http_log_module',
        key: 'access_log',
        params: [
            { primitive: 'string', label: 'path | off' },
            { primitive: 'string', label: 'format', optional: true },
            { primitive: 'flag', label: 'buffer', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'gzip', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'flush', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'if', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_log_module',
        key: 'log_format',
        params: [
            { primitive: 'string', label: 'name' },
            { primitive: 'flag', label: 'escape', optional: true, subSlot: { primitive: ['default', 'json', 'none'], prefix: '=' } },
            { primitive: 'string', label: 'string ...' }
        ],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_log_module',
        key: 'open_log_file_cache',
        params: [
            { primitive: 'string', label: 'off | max=N' },
            { primitive: 'flag', label: 'inactive', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'min_uses', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'valid', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_map_module
    {
        module: 'ngx_http_map_module',
        key: 'map',
        params: [
            { primitive: 'string', label: 'string' },
            { primitive: 'string', label: '$variable' },
            { primitive: 'context' }
        ],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_map_module',
        key: 'map_hash_bucket_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_map_module',
        key: 'map_hash_max_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http
    },
    // ngx_http_memcached_module
    {
        module: 'ngx_http_memcached_module',
        key: 'memcached_allow_upstream',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_memcached_module',
        key: 'memcached_bind',
        params: [
            { primitive: 'string', label: 'address | off' },
            { primitive: 'flag', label: 'transparent', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_memcached_module',
        key: 'memcached_bind_dynamic',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_memcached_module',
        key: 'memcached_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_memcached_module',
        key: 'memcached_connect_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_memcached_module',
        key: 'memcached_gzip_flag',
        params: [{ primitive: 'string', label: 'flag' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_memcached_module',
        key: 'memcached_next_upstream',
        params: [{ primitive: 'string', label: 'error | timeout | denied | invalid_response | not_found | off ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_memcached_module',
        key: 'memcached_next_upstream_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_memcached_module',
        key: 'memcached_next_upstream_tries',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_memcached_module',
        key: 'memcached_pass',
        params: [{ primitive: 'string', label: 'address' }],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_memcached_module',
        key: 'memcached_read_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_memcached_module',
        key: 'memcached_send_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_memcached_module',
        key: 'memcached_socket_keepalive',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_mirror_module
    {
        module: 'ngx_http_mirror_module',
        key: 'mirror',
        params: [{ primitive: 'string', label: 'uri | off' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_mirror_module',
        key: 'mirror_request_body',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_mp4_module
    {
        module: 'ngx_http_mp4_module',
        key: 'mp4',
        params: [],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_mp4_module',
        key: 'mp4_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_mp4_module',
        key: 'mp4_max_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_mp4_module',
        key: 'mp4_limit_rate',
        params: [{ primitive: 'string', label: 'on | off | factor' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_mp4_module',
        key: 'mp4_limit_rate_after',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_mp4_module',
        key: 'mp4_start_key_frame',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_num_map_module
    {
        module: 'ngx_http_num_map_module',
        key: 'num_map',
        params: [
            { primitive: 'string', label: '[$number] $variable' },
            { primitive: 'context' }
        ],
        context: EdgeDirectiveContext.http
    },
    // ngx_http_oidc_module
    {
        module: 'ngx_http_oidc_module',
        key: 'oidc_provider',
        params: [
            { primitive: 'string', label: 'name' },
            { primitive: 'context' }
        ],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_oidc_module',
        key: 'auth_oidc',
        params: [{ primitive: 'string', label: 'name | off' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_perl_module
    {
        module: 'ngx_http_perl_module',
        key: 'perl',
        params: [{ primitive: 'string', label: 'module::function | sub{...}' }],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_perl_module',
        key: 'perl_modules',
        params: [{ primitive: 'string', label: 'path' }],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_perl_module',
        key: 'perl_require',
        params: [{ primitive: 'string', label: 'module' }],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_perl_module',
        key: 'perl_set',
        params: [
            { primitive: 'string', label: '$variable' },
            { primitive: 'string', label: 'module::function | sub{...}' }
        ],
        context: EdgeDirectiveContext.http
    },
    // ngx_http_proxy_module
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_allow_upstream',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_bind',
        params: [
            { primitive: 'string', label: 'address | off' },
            { primitive: 'flag', label: 'transparent', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_bind_dynamic',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_buffering',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_buffers',
        params: [
            { primitive: 'number', label: 'number' },
            { primitive: 'string', label: 'size' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_busy_buffers_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_cache',
        params: [{ primitive: 'string', label: 'zone | off' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_cache_background_update',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_cache_bypass',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_cache_convert_head',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_cache_key',
        params: [{ primitive: 'string', label: 'string' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_cache_lock',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_cache_lock_age',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_cache_lock_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_cache_max_range_offset',
        params: [{ primitive: 'number', label: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_cache_methods',
        params: [{ primitive: 'string', label: 'GET | HEAD | POST ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_cache_min_uses',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_cache_path',
        params: [
            { primitive: 'string', label: 'path' },
            { primitive: 'flag', label: 'levels', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'use_temp_path', optional: true, subSlot: { primitive: ['on', 'off'], prefix: '=' } },
            { primitive: 'flag', label: 'keys_zone', subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'inactive', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'max_size', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'min_free', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'manager_files', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'manager_sleep', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'manager_threshold', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'loader_files', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'loader_sleep', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'loader_threshold', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'purger', optional: true, subSlot: { primitive: ['on', 'off'], prefix: '=' } },
            { primitive: 'flag', label: 'purger_files', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'purger_sleep', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'purger_threshold', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
        ],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_cache_purge',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_cache_revalidate',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_cache_use_stale',
        params: [{ primitive: 'string', label: 'error | timeout | invalid_header | updating | http_500 | http_502 | http_503 | http_504 | http_403 | http_404 | http_429 | off ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_cache_valid',
        params: [
            { primitive: 'string', label: '[code ...] time' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_connect_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_cookie_domain',
        params: [
            { primitive: 'string', label: 'domain | off' },
            { primitive: 'string', label: 'replacement', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_cookie_flags',
        params: [
            { primitive: 'string', label: 'cookie | off' },
            { primitive: 'string', label: 'flag ...', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_cookie_path',
        params: [
            { primitive: 'string', label: 'path | off' },
            { primitive: 'string', label: 'replacement', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_force_ranges',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_headers_hash_bucket_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_headers_hash_max_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_hide_header',
        params: [{ primitive: 'string', label: 'field' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_http_version',
        params: [{ primitive: ['1.0', '1.1', '2'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_ignore_client_abort',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_ignore_headers',
        params: [{ primitive: 'string', label: 'field ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_intercept_errors',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_limit_rate',
        params: [{ primitive: 'string', label: 'rate' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_max_temp_file_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_method',
        params: [{ primitive: 'string', label: 'method' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_next_upstream',
        params: [{ primitive: 'string', label: 'error | timeout | denied | invalid_header | http_500 | http_502 | http_503 | http_504 | http_403 | http_404 | http_429 | non_idempotent | off ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_next_upstream_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_next_upstream_tries',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_no_cache',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_pass',
        params: [{ primitive: 'string', label: 'URL' }],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_pass_header',
        params: [{ primitive: 'string', label: 'field' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_pass_request_body',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_pass_request_headers',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_pass_trailers',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_read_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_redirect',
        params: [
            { primitive: 'string', label: 'default | off | redirect' },
            { primitive: 'string', label: 'replacement', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_request_buffering',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_request_dynamic',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_send_lowat',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_send_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_set_body',
        params: [{ primitive: 'string', label: 'value' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_set_header',
        params: [
            { primitive: 'string', label: 'field' },
            { primitive: 'string', label: 'value' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_socket_keepalive',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_ssl_certificate',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_ssl_certificate_cache',
        params: [
            { primitive: ['off', 'max'], label: 'mode' },
            { primitive: 'flag', label: 'max', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'inactive', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'valid', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_ssl_certificate_key',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_ssl_ciphers',
        params: [{ primitive: 'string', label: 'ciphers' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_ssl_conf_command',
        params: [
            { primitive: 'string', label: 'name' },
            { primitive: 'string', label: 'value' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_ssl_crl',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_ssl_key_log',
        params: [{ primitive: 'string', label: 'path' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_ssl_name',
        params: [{ primitive: 'string', label: 'name' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_ssl_password_file',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_ssl_protocols',
        params: [
            { primitive: 'flag', label: 'SSLv2', optional: true },
            { primitive: 'flag', label: 'SSLv3', optional: true },
            { primitive: 'flag', label: 'TLSv1', optional: true },
            { primitive: 'flag', label: 'TLSv1.1', optional: true },
            { primitive: 'flag', label: 'TLSv1.2', optional: true },
            { primitive: 'flag', label: 'TLSv1.3', optional: true },
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_ssl_server_name',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_ssl_session_reuse',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_ssl_trusted_certificate',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_ssl_verify',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_ssl_verify_depth',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_store',
        params: [{ primitive: 'string', label: 'on | off | string' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_store_access',
        params: [{ primitive: 'string', label: 'users:permissions ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_temp_file_write_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_proxy_module',
        key: 'proxy_temp_path',
        params: [
            { primitive: 'string', label: 'path' },
            { primitive: 'number', label: 'level1', optional: true },
            { primitive: 'number', label: 'level2', optional: true },
            { primitive: 'number', label: 'level3', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_proxy_protocol_vendor_module (no directives, only embedded variables)
    // ngx_http_random_index_module
    {
        module: 'ngx_http_random_index_module',
        key: 'random_index',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.location
    },
    // ngx_http_realip_module
    {
        module: 'ngx_http_realip_module',
        key: 'set_real_ip_from',
        params: [{ primitive: 'string', label: 'address | CIDR | unix:' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_realip_module',
        key: 'real_ip_header',
        params: [{ primitive: 'string', label: 'field | X-Real-IP | X-Forwarded-For | proxy_protocol' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_realip_module',
        key: 'real_ip_recursive',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_referer_module
    {
        module: 'ngx_http_referer_module',
        key: 'referer_hash_bucket_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_referer_module',
        key: 'referer_hash_max_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_referer_module',
        key: 'valid_referers',
        params: [{ primitive: 'string', label: 'none | blocked | server_names | string ...' }],
        context: EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_rewrite_module (already defined above)
    // ngx_http_scgi_module
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_allow_upstream',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_bind',
        params: [
            { primitive: 'string', label: 'address | off' },
            { primitive: 'flag', label: 'transparent', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_bind_dynamic',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_buffering',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_buffers',
        params: [
            { primitive: 'number', label: 'number' },
            { primitive: 'string', label: 'size' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_busy_buffers_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_cache',
        params: [{ primitive: 'string', label: 'zone | off' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_cache_background_update',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_cache_bypass',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_cache_key',
        params: [{ primitive: 'string', label: 'string' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_cache_lock',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_cache_lock_age',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_cache_lock_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_cache_max_range_offset',
        params: [{ primitive: 'number', label: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_cache_methods',
        params: [{ primitive: 'string', label: 'GET | HEAD | POST ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_cache_min_uses',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_cache_path',
        params: [
            { primitive: 'string', label: 'path' },
            { primitive: 'flag', label: 'levels', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'use_temp_path', optional: true, subSlot: { primitive: ['on', 'off'], prefix: '=' } },
            { primitive: 'flag', label: 'keys_zone', subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'inactive', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'max_size', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'min_free', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'manager_files', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'manager_sleep', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'manager_threshold', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'loader_files', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'loader_sleep', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'loader_threshold', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'purger', optional: true, subSlot: { primitive: ['on', 'off'], prefix: '=' } },
            { primitive: 'flag', label: 'purger_files', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'purger_sleep', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'purger_threshold', optional: true, subSlot: { primitive: 'string', prefix: '=' } }
        ],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_cache_purge',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_cache_revalidate',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_cache_use_stale',
        params: [{ primitive: 'string', label: 'error | timeout | invalid_header | updating | http_500 | http_503 | http_403 | http_404 | http_429 | off ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_cache_valid',
        params: [
            { primitive: 'string', label: '[code ...]', optional: true },
            { primitive: 'string', label: 'time' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_connect_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_force_ranges',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_hide_header',
        params: [{ primitive: 'string', label: 'field' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_ignore_client_abort',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_ignore_headers',
        params: [{ primitive: 'string', label: 'field ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_intercept_errors',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_limit_rate',
        params: [{ primitive: 'string', label: 'rate' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_max_temp_file_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_next_upstream',
        params: [{ primitive: 'string', label: 'error | timeout | denied | invalid_header | http_500 | http_503 | http_403 | http_404 | http_429 | non_idempotent | off ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_next_upstream_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_next_upstream_tries',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_no_cache',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_param',
        params: [
            { primitive: 'string', label: 'parameter' },
            { primitive: 'string', label: 'value' },
            { primitive: 'flag', label: 'if_not_empty', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_pass',
        params: [{ primitive: 'string', label: 'address' }],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_pass_header',
        params: [{ primitive: 'string', label: 'field' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_pass_request_body',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_pass_request_headers',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_read_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_request_buffering',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_request_dynamic',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_send_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_socket_keepalive',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_store',
        params: [{ primitive: 'string', label: 'on | off | string' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_store_access',
        params: [{ primitive: 'string', label: 'users:permissions ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_temp_file_write_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_scgi_module',
        key: 'scgi_temp_path',
        params: [
            { primitive: 'string', label: 'path' },
            { primitive: 'number', label: 'level1', optional: true },
            { primitive: 'number', label: 'level2', optional: true },
            { primitive: 'number', label: 'level3', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_secure_link_module
    {
        module: 'ngx_http_secure_link_module',
        key: 'secure_link',
        params: [{ primitive: 'string', label: 'expression' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_secure_link_module',
        key: 'secure_link_md5',
        params: [{ primitive: 'string', label: 'expression' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_secure_link_module',
        key: 'secure_link_secret',
        params: [{ primitive: 'string', label: 'word' }],
        context: EdgeDirectiveContext.location
    },
    // ngx_http_session_log_module
    {
        module: 'ngx_http_session_log_module',
        key: 'session_log',
        params: [{ primitive: 'string', label: 'name | off' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_session_log_module',
        key: 'session_log_format',
        params: [
            { primitive: 'string', label: 'name' },
            { primitive: 'string', label: 'string ...' }
        ],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_session_log_module',
        key: 'session_log_zone',
        params: [
            { primitive: 'string', label: 'path' },
            { primitive: 'flag', label: 'zone', subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'format', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'timeout', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'id', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'md5', optional: true, subSlot: { primitive: 'string', prefix: '=' } }
        ],
        context: EdgeDirectiveContext.http
    },
    // ngx_http_slice_module
    {
        module: 'ngx_http_slice_module',
        key: 'slice',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_split_clients_module
    {
        module: 'ngx_http_split_clients_module',
        key: 'split_clients',
        params: [
            { primitive: 'string', label: 'string' },
            { primitive: 'string', label: '$variable' },
            { primitive: 'context' }
        ],
        context: EdgeDirectiveContext.http
    },
    // ngx_http_ssi_module
    {
        module: 'ngx_http_ssi_module',
        key: 'ssi',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_ssi_module',
        key: 'ssi_last_modified',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_ssi_module',
        key: 'ssi_min_file_chunk',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_ssi_module',
        key: 'ssi_silent_errors',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_ssi_module',
        key: 'ssi_types',
        params: [{ primitive: 'string', label: 'mime-type ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_ssi_module',
        key: 'ssi_value_length',
        params: [{ primitive: 'number', label: 'length' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_status_module
    {
        module: 'ngx_http_status_module',
        key: 'status',
        params: [],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_status_module',
        key: 'status_format',
        params: [{ primitive: 'string', label: 'json | jsonp [callback]' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_status_module',
        key: 'status_zone',
        params: [{ primitive: 'string', label: 'zone' }],
        context: EdgeDirectiveContext.server
    },
    // ngx_http_stub_status_module
    {
        module: 'ngx_http_stub_status_module',
        key: 'stub_status',
        params: [],
        context: EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_sub_module
    {
        module: 'ngx_http_sub_module',
        key: 'sub_filter',
        params: [
            { primitive: 'string', label: 'string' },
            { primitive: 'string', label: 'replacement' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_sub_module',
        key: 'sub_filter_last_modified',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_sub_module',
        key: 'sub_filter_once',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_sub_module',
        key: 'sub_filter_types',
        params: [{ primitive: 'string', label: 'mime-type ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_tunnel_module
    {
        module: 'ngx_http_tunnel_module',
        key: 'tunnel_allow_upstream',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_tunnel_module',
        key: 'tunnel_bind',
        params: [{ primitive: 'string', label: 'address | off' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_tunnel_module',
        key: 'tunnel_bind_dynamic',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_tunnel_module',
        key: 'tunnel_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_tunnel_module',
        key: 'tunnel_connect_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_tunnel_module',
        key: 'tunnel_next_upstream',
        params: [{ primitive: 'string', label: 'error | timeout | denied | off ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_tunnel_module',
        key: 'tunnel_next_upstream_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_tunnel_module',
        key: 'tunnel_next_upstream_tries',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_tunnel_module',
        key: 'tunnel_pass',
        params: [{ primitive: 'string', label: 'address', optional: true }],
        context: EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_tunnel_module',
        key: 'tunnel_read_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_tunnel_module',
        key: 'tunnel_send_lowat',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_tunnel_module',
        key: 'tunnel_send_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_tunnel_module',
        key: 'tunnel_socket_keepalive',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_upstream_module
    {
        module: 'ngx_http_upstream_module',
        key: 'upstream',
        params: [
            { primitive: 'string', label: 'name' },
            { primitive: 'context' }
        ],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_upstream_module',
        key: 'server',
        params: [
            { primitive: 'string', label: 'address' },
            { primitive: 'flag', label: 'weight', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'max_conns', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'max_fails', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'fail_timeout', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'backup', optional: true },
            { primitive: 'flag', label: 'down', optional: true },
            { primitive: 'flag', label: 'resolve', optional: true },
            { primitive: 'flag', label: 'service', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'route', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'drain', optional: true },
            { primitive: 'flag', label: 'slow_start', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
        ],
        context: EdgeDirectiveContext.upstream
    },
    {
        module: 'ngx_http_upstream_module',
        key: 'zone',
        params: [
            { primitive: 'string', label: 'name' },
            { primitive: 'string', label: 'size', optional: true }
        ],
        context: EdgeDirectiveContext.upstream
    },
    {
        module: 'ngx_http_upstream_module',
        key: 'state',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.upstream
    },
    {
        module: 'ngx_http_upstream_module',
        key: 'hash',
        params: [
            { primitive: 'string', label: 'key' },
            { primitive: 'flag', label: 'consistent', optional: true }
        ],
        context: EdgeDirectiveContext.upstream
    },
    {
        module: 'ngx_http_upstream_module',
        key: 'ip_hash',
        params: [],
        context: EdgeDirectiveContext.upstream
    },
    {
        module: 'ngx_http_upstream_module',
        key: 'keepalive',
        params: [
            { primitive: 'number', label: 'connections' },
            { primitive: 'flag', label: 'local', optional: true }
        ],
        context: EdgeDirectiveContext.upstream
    },
    {
        module: 'ngx_http_upstream_module',
        key: 'keepalive_requests',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.upstream
    },
    {
        module: 'ngx_http_upstream_module',
        key: 'keepalive_time',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.upstream
    },
    {
        module: 'ngx_http_upstream_module',
        key: 'keepalive_timeout',
        params: [{ primitive: 'string', label: 'timeout' }],
        context: EdgeDirectiveContext.upstream
    },
    {
        module: 'ngx_http_upstream_module',
        key: 'ntlm',
        params: [],
        context: EdgeDirectiveContext.upstream
    },
    {
        module: 'ngx_http_upstream_module',
        key: 'least_conn',
        params: [],
        context: EdgeDirectiveContext.upstream
    },
    {
        module: 'ngx_http_upstream_module',
        key: 'least_time',
        params: [
            { primitive: ['header', 'last_byte'] },
            { primitive: 'flag', label: 'inflight', optional: true }
        ],
        context: EdgeDirectiveContext.upstream
    },
    {
        module: 'ngx_http_upstream_module',
        key: 'queue',
        params: [
            { primitive: 'number', label: 'number' },
            { primitive: 'flag', label: 'timeout', optional: true, subSlot: { primitive: 'string', prefix: '=' } }
        ],
        context: EdgeDirectiveContext.upstream
    },
    {
        module: 'ngx_http_upstream_module',
        key: 'random',
        params: [
            { primitive: 'flag', label: 'two', optional: true },
            { primitive: ['least_conn', 'least_time=header', 'least_time=last_byte'], label: 'method', optional: true }
        ],
        context: EdgeDirectiveContext.upstream
    },
    {
        module: 'ngx_http_upstream_module',
        key: 'resolver',
        params: [
            { primitive: 'string', label: 'address ...' },
            { primitive: 'flag', label: 'valid', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'ipv4', optional: true, subSlot: { primitive: ['on', 'off'], prefix: '=' } },
            { primitive: 'flag', label: 'ipv6', optional: true, subSlot: { primitive: ['on', 'off'], prefix: '=' } },
            { primitive: 'flag', label: 'status_zone', optional: true, subSlot: { primitive: 'string', prefix: '=' } }
        ],
        context: EdgeDirectiveContext.upstream
    },
    {
        module: 'ngx_http_upstream_module',
        key: 'resolver_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.upstream
    },
    {
        module: 'ngx_http_upstream_module',
        key: 'sticky',
        params: [{ primitive: 'string', label: 'cookie name [...] | route $variable ... | learn create=$variable lookup=$variable zone=name:size [...]' }],
        context: EdgeDirectiveContext.upstream
    },
    // ngx_http_upstream_conf_module
    {
        module: 'ngx_http_upstream_conf_module',
        key: 'upstream_conf',
        params: [],
        context: EdgeDirectiveContext.location
    },
    // ngx_http_upstream_hc_module
    {
        module: 'ngx_http_upstream_hc_module',
        key: 'health_check',
        params: [
            { primitive: 'flag', label: 'interval', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'jitter', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'fails', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'passes', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'uri', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'mandatory', optional: true },
            { primitive: 'flag', label: 'persistent', optional: true },
            { primitive: 'flag', label: 'match', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'port', optional: true, subSlot: { primitive: 'number', prefix: '=' } }
        ],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_upstream_hc_module',
        key: 'match',
        params: [
            { primitive: 'string', label: 'name' },
            { primitive: 'context' }
        ],
        context: EdgeDirectiveContext.http
    },
    // ngx_http_userid_module
    {
        module: 'ngx_http_userid_module',
        key: 'userid',
        params: [{ primitive: ['on', 'v1', 'log', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_userid_module',
        key: 'userid_domain',
        params: [{ primitive: 'string', label: 'name | none' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_userid_module',
        key: 'userid_expires',
        params: [{ primitive: 'string', label: 'time | max | off' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_userid_module',
        key: 'userid_flags',
        params: [{ primitive: 'string', label: 'off | flag ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_userid_module',
        key: 'userid_mark',
        params: [{ primitive: 'string', label: 'letter | digit | = | off' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_userid_module',
        key: 'userid_name',
        params: [{ primitive: 'string', label: 'name' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_userid_module',
        key: 'userid_p3p',
        params: [{ primitive: 'string', label: 'string | none' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_userid_module',
        key: 'userid_path',
        params: [{ primitive: 'string', label: 'path' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_userid_module',
        key: 'userid_service',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_uwsgi_module
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_allow_upstream',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_bind',
        params: [
            { primitive: 'string', label: 'address | off' },
            { primitive: 'flag', label: 'transparent', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_bind_dynamic',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_buffering',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_buffers',
        params: [
            { primitive: 'number', label: 'number' },
            { primitive: 'string', label: 'size' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_busy_buffers_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_cache',
        params: [{ primitive: 'string', label: 'zone | off' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_cache_background_update',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_cache_bypass',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_cache_key',
        params: [{ primitive: 'string', label: 'string' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_cache_lock',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_cache_lock_age',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_cache_lock_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_cache_max_range_offset',
        params: [{ primitive: 'number', label: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_cache_methods',
        params: [{ primitive: 'string', label: 'GET | HEAD | POST ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_cache_min_uses',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_cache_path',
        params: [
            { primitive: 'string', label: 'path' },
            { primitive: 'flag', label: 'levels', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'use_temp_path', optional: true, subSlot: { primitive: ['on', 'off'], prefix: '=' } },
            { primitive: 'flag', label: 'keys_zone', subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'inactive', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'max_size', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'min_free', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'manager_files', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'manager_sleep', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'manager_threshold', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'loader_files', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'loader_sleep', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'loader_threshold', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'purger', optional: true, subSlot: { primitive: ['on', 'off'], prefix: '=' } },
            { primitive: 'flag', label: 'purger_files', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'purger_sleep', optional: true, subSlot: { primitive: 'string', prefix: '=' } },
            { primitive: 'flag', label: 'purger_threshold', optional: true, subSlot: { primitive: 'string', prefix: '=' } }
        ],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_cache_purge',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_cache_revalidate',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_cache_use_stale',
        params: [{ primitive: 'string', label: 'error | timeout | invalid_header | updating | http_500 | http_503 | http_403 | http_404 | http_429 | off ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_cache_valid',
        params: [
            { primitive: 'string', label: '[code ...]', optional: true },
            { primitive: 'string', label: 'time' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_connect_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_force_ranges',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_hide_header',
        params: [{ primitive: 'string', label: 'field' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_ignore_client_abort',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_ignore_headers',
        params: [{ primitive: 'string', label: 'field ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_intercept_errors',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_limit_rate',
        params: [{ primitive: 'string', label: 'rate' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_max_temp_file_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_modifier1',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_modifier2',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_next_upstream',
        params: [{ primitive: 'string', label: 'error | timeout | denied | invalid_header | http_500 | http_503 | http_403 | http_404 | http_429 | non_idempotent | off ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_next_upstream_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_next_upstream_tries',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_no_cache',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_param',
        params: [
            { primitive: 'string', label: 'parameter' },
            { primitive: 'string', label: 'value' },
            { primitive: 'flag', label: 'if_not_empty', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_pass',
        params: [{ primitive: 'string', label: '[protocol://]address' }],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_pass_header',
        params: [{ primitive: 'string', label: 'field' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_pass_request_body',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_pass_request_headers',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_read_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_request_buffering',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_request_dynamic',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_send_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_socket_keepalive',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_ssl_certificate',
        params: [{ primitive: 'ssl' }], //[{ primitive: 'string', label: 'file' }]
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_ssl_certificate_cache',
        params: [{ primitive: 'string', label: 'off | max=N [inactive=time] [valid=time]' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_ssl_certificate_key',
        params: [{ primitive: 'ssl' }], //[{ primitive: 'string', label: 'file' }]
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_ssl_ciphers',
        params: [{ primitive: 'string', label: 'ciphers' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_ssl_conf_command',
        params: [
            { primitive: 'string', label: 'name' },
            { primitive: 'string', label: 'value' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_ssl_crl',
        params: [{ primitive: 'ssl' }], //[{ primitive: 'string', label: 'file' }]
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_ssl_key_log',
        params: [{ primitive: 'string', label: 'path' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_ssl_name',
        params: [{ primitive: 'string', label: 'name' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_ssl_password_file',
        params: [{ primitive: 'ssl' }], //[{ primitive: 'string', label: 'file' }]
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_ssl_protocols',
        params: [{ primitive: 'string', label: '[SSLv2] [SSLv3] [TLSv1] [TLSv1.1] [TLSv1.2] [TLSv1.3]' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_ssl_server_name',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_ssl_session_reuse',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_ssl_trusted_certificate',
        params: [{ primitive: 'ssl' }], //[{ primitive: 'string', label: 'file' }]
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_ssl_verify',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_ssl_verify_depth',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_store',
        params: [{ primitive: 'string', label: 'on | off | string' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_store_access',
        params: [{ primitive: 'string', label: 'users:permissions ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_temp_file_write_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_uwsgi_module',
        key: 'uwsgi_temp_path',
        params: [
            { primitive: 'string', label: 'path' },
            { primitive: 'number', label: 'level1', optional: true },
            { primitive: 'number', label: 'level2', optional: true },
            { primitive: 'number', label: 'level3', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_v2_module
    {
        module: 'ngx_http_v2_module',
        key: 'http2',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_v2_module',
        key: 'http2_body_preread_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_v2_module',
        key: 'http2_chunk_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_v2_module',
        key: 'http2_idle_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_v2_module',
        key: 'http2_max_concurrent_pushes',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_v2_module',
        key: 'http2_max_concurrent_streams',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_v2_module',
        key: 'http2_max_field_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_v2_module',
        key: 'http2_max_header_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_v2_module',
        key: 'http2_max_requests',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_v2_module',
        key: 'http2_push',
        params: [{ primitive: 'string', label: 'uri | off' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_v2_module',
        key: 'http2_push_preload',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_v2_module',
        key: 'http2_recv_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http
    },
    {
        module: 'ngx_http_v2_module',
        key: 'http2_recv_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    // ngx_http_v3_module
    {
        module: 'ngx_http_v3_module',
        key: 'http3',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_v3_module',
        key: 'http3_hq',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_v3_module',
        key: 'http3_max_concurrent_streams',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_v3_module',
        key: 'http3_stream_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_v3_module',
        key: 'quic_active_connection_id_limit',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_v3_module',
        key: 'quic_bpf',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.main
    },
    {
        module: 'ngx_http_v3_module',
        key: 'quic_gso',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_v3_module',
        key: 'quic_host_key',
        params: [{ primitive: 'ssl' }], //[{ primitive: 'string', label: 'file' }]
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        module: 'ngx_http_v3_module',
        key: 'quic_retry',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    // ngx_http_xslt_module
    {
        module: 'ngx_http_xslt_module',
        key: 'xml_entities',
        params: [{ primitive: 'string', label: 'path' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_xslt_module',
        key: 'xslt_last_modified',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_xslt_module',
        key: 'xslt_param',
        params: [
            { primitive: 'string', label: 'parameter' },
            { primitive: 'string', label: 'value' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_xslt_module',
        key: 'xslt_string_param',
        params: [
            { primitive: 'string', label: 'parameter' },
            { primitive: 'string', label: 'value' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_xslt_module',
        key: 'xslt_stylesheet',
        params: [
            { primitive: 'string', label: 'stylesheet' },
            { primitive: 'string', label: 'parameter=value ...', optional: true }
        ],
        context: EdgeDirectiveContext.location
    },
    {
        module: 'ngx_http_xslt_module',
        key: 'xslt_types',
        params: [{ primitive: 'string', label: 'mime-type ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
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