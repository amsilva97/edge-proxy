export type EdgePrimitive =
    | 'context' // nested block with its own set of directives
    | string[] // select one of the provided string literals
    | 'string' // a simple string value
    | 'number' // a simple number value
    | 'flag'   // keyword flag — present (checked) or absent, no value
    // Non-directive primitives
    | 'ssl' // will use the apps saved ssl
    | 'snippet' // will use the apps saved snippets

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
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.events
    },
    {
        key: 'accept_mutex_delay',
        params: [{ primitive: 'number', suffix: 'ms' }],
        context: EdgeDirectiveContext.events
    },
    {
        key: 'daemon',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'debug_connection',
        params: [{ primitive: 'string', label: 'address | CIDR | unix:' }],
        context: EdgeDirectiveContext.events
    },
    {
        key: 'debug_points',
        params: [{ primitive: ['abort', 'stop'] }],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'env',
        params: [{ primitive: 'string', subSlot: { primitive: 'string', prefix: '=' } }],
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
        params: [{ primitive: 'context' }],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'include',
        params: [{ primitive: 'snippet' }],
        context: EdgeDirectiveContext.any
    },
    {
        key: 'load_module',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'lock_file',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'master_process',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'multi_accept',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.events
    },
    {
        key: 'pcre_jit',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'pid',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'ssl_engine',
        params: [{ primitive: 'string', label: 'device' }],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'ssl_object_cache_inheritable',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'stall_threshold',
        params: [{ primitive: 'number', suffix: 'ms' }],
        context: EdgeDirectiveContext.events
    },
    {
        key: 'thread_pool',
        params: [
            { primitive: 'string', label: 'name' },
            { primitive: 'flag', label: 'threads', subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'max_queue', subSlot: { primitive: 'number', prefix: '=' }, optional: true }
        ],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'timer_resolution',
        params: [{ primitive: 'number', label: 'interval', suffix: 'ms' }],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'use',
        params: [{ primitive: 'string', label: 'method' }],
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
        params: [{ primitive: 'string', label: 'number' }],
        context: EdgeDirectiveContext.events
    },
    {
        key: 'worker_connections',
        params: [{ primitive: 'string', label: 'number' }],
        context: EdgeDirectiveContext.events
    },
    {
        key: 'worker_cpu_affinity',
        params: [{ primitive: 'string', label: 'cpumask... | auto [cpumask]' }],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'worker_priority',
        params: [{ primitive: 'string', label: 'number' }],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'worker_processes',
        params: [{ primitive: 'string', label: 'number | auto' }],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'worker_rlimit_core',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'worker_rlimit_nofile',
        params: [{ primitive: 'string', label: 'number' }],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'worker_shutdown_timeout',
        params: [{ primitive: 'number', label: 'time', suffix: 'ms' }],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'working_directory',
        params: [{ primitive: 'string', label: 'directory' }],
        context: EdgeDirectiveContext.main
    },
    // ngx_http_core_module
    {
        key: 'absolute_redirect',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'aio',
        params: [{ primitive: ['on', 'off', 'threads'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'aio_write',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'alias',
        params: [{ primitive: 'string', label: 'path' }],
        context: EdgeDirectiveContext.location
    },
    {
        key: 'auth_delay',
        params: [{ primitive: 'number', suffix: 's' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'chunked_transfer_encoding',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'client_body_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'client_body_in_file_only',
        params: [{ primitive: ['on', 'clean', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'client_body_in_single_buffer',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
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
        key: 'client_body_timeout',
        params: [{ primitive: 'number', suffix: 's' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'client_header_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'client_header_timeout',
        params: [{ primitive: 'number', suffix: 's' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'client_max_body_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'connection_pool_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'default_type',
        params: [{ primitive: 'string', label: 'mime-type' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'directio',
        params: [{ primitive: 'string', label: 'size | off' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'directio_alignment',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'disable_symlinks',
        params: [
            { primitive: ['off', 'on', 'if_not_owner'] },
            { primitive: 'flag', label: 'from', optional: true, subSlot: { primitive: 'string', prefix: '=' } }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'early_hints',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'error_page',
        params: [
            { primitive: 'string', label: 'code ...' },
            { primitive: 'string', label: '[=[response]] uri' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'etag',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'http',
        params: [{ primitive: 'context' }],
        context: EdgeDirectiveContext.main
    },
    {
        key: 'if_modified_since',
        params: [{ primitive: ['off', 'exact', 'before'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'ignore_invalid_headers',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'internal',
        params: [],
        context: EdgeDirectiveContext.location
    },
    {
        key: 'keepalive_disable',
        params: [{ primitive: ['none', 'msie6', 'safari'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'keepalive_min_timeout',
        params: [{ primitive: 'number', suffix: 's' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'keepalive_requests',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'keepalive_time',
        params: [{ primitive: 'number', suffix: 'h' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'keepalive_timeout',
        params: [
            { primitive: 'number', suffix: 's' },
            { primitive: 'number', label: 'header_timeout', suffix: 's', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'large_client_header_buffers',
        params: [
            { primitive: 'number', label: 'number' },
            { primitive: 'string', label: 'size' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'limit_except',
        params: [
            { primitive: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'MKCOL', 'COPY', 'MOVE', 'OPTIONS', 'PROPFIND', 'PROPPATCH', 'LOCK', 'UNLOCK', 'PATCH'] },
            { primitive: 'context' }
        ],
        context: EdgeDirectiveContext.location
    },
    {
        key: 'limit_rate',
        params: [{ primitive: 'string', label: 'rate' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'limit_rate_after',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'lingering_close',
        params: [{ primitive: ['off', 'on', 'always'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'lingering_time',
        params: [{ primitive: 'number', suffix: 's' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'lingering_timeout',
        params: [{ primitive: 'number', suffix: 's' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
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
        key: 'location',
        params: [
            { primitive: 'string', label: '[ = | ~ | ~* | ^~ ] uri' },
            { primitive: 'context' }
        ],
        context: EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'log_not_found',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'log_subrequest',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'max_headers',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'max_ranges',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'merge_slashes',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'msie_padding',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'msie_refresh',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'open_file_cache',
        params: [
            { primitive: ['off', 'max'], label: 'mode' },
            { primitive: 'flag', label: 'max', optional: true, subSlot: { primitive: 'number', prefix: '=' } },
            { primitive: 'flag', label: 'inactive', optional: true, subSlot: { primitive: 'number', prefix: '=', suffix: 's' } }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'open_file_cache_errors',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'open_file_cache_min_uses',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'open_file_cache_valid',
        params: [{ primitive: 'number', suffix: 's' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'output_buffers',
        params: [
            { primitive: 'number', label: 'number' },
            { primitive: 'string', label: 'size' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'port_in_redirect',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'postpone_output',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'read_ahead',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'recursive_error_pages',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'request_pool_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'reset_timedout_connection',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
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
        key: 'resolver_timeout',
        params: [{ primitive: 'number', suffix: 's' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'root',
        params: [{ primitive: 'string', label: 'path' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'satisfy',
        params: [{ primitive: ['all', 'any'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'send_lowat',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'send_timeout',
        params: [{ primitive: 'number', suffix: 's' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'sendfile',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'sendfile_max_chunk',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'server',
        params: [{ primitive: 'context' }],
        context: EdgeDirectiveContext.http
    },
    {
        key: 'server_name',
        params: [{ primitive: 'string', label: 'name ...' }],
        context: EdgeDirectiveContext.server
    },
    {
        key: 'server_name_in_redirect',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'server_names_hash_bucket_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http
    },
    {
        key: 'server_names_hash_max_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http
    },
    {
        key: 'server_tokens',
        params: [{ primitive: ['on', 'off', 'build'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'subrequest_output_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'tcp_nodelay',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'tcp_nopush',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'try_files',
        params: [{ primitive: 'string', label: 'file ... uri | =code' }],
        context: EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'types',
        params: [{ primitive: 'context' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'types_hash_bucket_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'types_hash_max_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'underscores_in_headers',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'variables_hash_bucket_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http
    },
    {
        key: 'variables_hash_max_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http
    },
    // ngx_http_rewrite_module
    {
        key: 'break',
        params: [],
        context: EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'if',
        params: [
            { primitive: 'string', label: 'condition' },
            { primitive: 'context' }
        ],
        context: EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'return',
        params: [
            { primitive: 'string', label: 'code | URL' },
            { primitive: 'string', label: 'text | URL', optional: true }
        ],
        context: EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'rewrite',
        params: [
            { primitive: 'string', label: 'regex' },
            { primitive: 'string', label: 'replacement' },
            { primitive: ['last', 'break', 'redirect', 'permanent'], optional: true }
        ],
        context: EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'rewrite_log',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'set',
        params: [
            { primitive: 'string', label: '$variable' },
            { primitive: 'string', label: 'value' }
        ],
        context: EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'uninitialized_variable_warn',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    // ngx_http_ssl_module
    {
        key: 'ssl',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_certificate',
        params: [{ primitive: 'ssl' }], //[{ primitive: 'string', label: 'file' }], // Overriding the params to use the user save ssls
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
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
        key: 'ssl_certificate_compression',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_certificate_key',
        params: [{ primitive: 'ssl' }], //[{ primitive: 'string', label: 'file' }], // Overriding the params to use the user save ssls
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_ciphers',
        params: [{ primitive: 'string', label: 'ciphers' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_client_certificate',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_conf_command',
        params: [
            { primitive: 'string', label: 'name' },
            { primitive: 'string', label: 'value' },
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_crl',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_dhparam',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_early_data',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_ecdh_curve',
        params: [{ primitive: 'string', label: 'curve' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_ech_file',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_key_log',
        params: [{ primitive: 'string', label: 'path' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_ocsp',
        params: [{ primitive: ['on', 'off', 'leaf'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_ocsp_cache',
        params: [{ primitive: 'string', label: 'off | shared:name:size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_ocsp_responder',
        params: [{ primitive: 'string', label: 'url' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_password_file',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_prefer_server_ciphers',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
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
        key: 'ssl_reject_handshake',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_session_cache',
        params: [{ primitive: 'string', label: 'off|none|builtin[:size]|shared:name:size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_session_ticket_key',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_session_tickets',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_session_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_stapling',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_stapling_file',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_stapling_responder',
        params: [{ primitive: 'string', label: 'url' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_stapling_verify',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_trusted_certificate',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_verify_client',
        params: [{ primitive: ['on', 'off', 'optional', 'optional_no_ca'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
    {
        key: 'ssl_verify_depth',
        params: [{ primitive: 'number', label: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server
    },
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
    {
        key: 'proxy_allow_upstream',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_bind',
        params: [
            { primitive: 'string', label: 'address | off' },
            { primitive: 'flag', label: 'transparent', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_bind_dynamic',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_buffer_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_buffering',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_buffers',
        params: [
            { primitive: 'number', label: 'number' },
            { primitive: 'string', label: 'size' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_busy_buffers_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_cache',
        params: [{ primitive: 'string', label: 'zone | off' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_cache_background_update',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_cache_bypass',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_cache_convert_head',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_cache_key',
        params: [{ primitive: 'string', label: 'string' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_cache_lock',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_cache_lock_age',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_cache_lock_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_cache_max_range_offset',
        params: [{ primitive: 'number', label: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_cache_methods',
        params: [{ primitive: 'string', label: 'GET | HEAD | POST ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_cache_min_uses',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
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
        key: 'proxy_cache_purge',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_cache_revalidate',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_cache_use_stale',
        params: [{ primitive: 'string', label: 'error | timeout | invalid_header | updating | http_500 | http_502 | http_503 | http_504 | http_403 | http_404 | http_429 | off ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_cache_valid',
        params: [
            { primitive: 'string', label: '[code ...] time' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_connect_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_cookie_domain',
        params: [
            { primitive: 'string', label: 'domain | off' },
            { primitive: 'string', label: 'replacement', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_cookie_flags',
        params: [
            { primitive: 'string', label: 'cookie | off' },
            { primitive: 'string', label: 'flag ...', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_cookie_path',
        params: [
            { primitive: 'string', label: 'path | off' },
            { primitive: 'string', label: 'replacement', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_force_ranges',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_headers_hash_bucket_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_headers_hash_max_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_hide_header',
        params: [{ primitive: 'string', label: 'field' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_http_version',
        params: [{ primitive: ['1.0', '1.1', '2'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_ignore_client_abort',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_ignore_headers',
        params: [{ primitive: 'string', label: 'field ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_intercept_errors',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_limit_rate',
        params: [{ primitive: 'string', label: 'rate' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_max_temp_file_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_method',
        params: [{ primitive: 'string', label: 'method' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_next_upstream',
        params: [{ primitive: 'string', label: 'error | timeout | denied | invalid_header | http_500 | http_502 | http_503 | http_504 | http_403 | http_404 | http_429 | non_idempotent | off ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_next_upstream_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_next_upstream_tries',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_no_cache',
        params: [{ primitive: 'string', label: 'string ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_pass',
        params: [{ primitive: 'string', label: 'URL' }],
        context: EdgeDirectiveContext.location
    },
    {
        key: 'proxy_pass_header',
        params: [{ primitive: 'string', label: 'field' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_pass_request_body',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_pass_request_headers',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_pass_trailers',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_read_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_redirect',
        params: [
            { primitive: 'string', label: 'default | off | redirect' },
            { primitive: 'string', label: 'replacement', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_request_buffering',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_request_dynamic',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_send_lowat',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_send_timeout',
        params: [{ primitive: 'string', label: 'time' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_set_body',
        params: [{ primitive: 'string', label: 'value' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_set_header',
        params: [
            { primitive: 'string', label: 'field' },
            { primitive: 'string', label: 'value' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_socket_keepalive',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_ssl_certificate',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
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
        key: 'proxy_ssl_certificate_key',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_ssl_ciphers',
        params: [{ primitive: 'string', label: 'ciphers' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_ssl_conf_command',
        params: [
            { primitive: 'string', label: 'name' },
            { primitive: 'string', label: 'value' }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_ssl_crl',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_ssl_key_log',
        params: [{ primitive: 'string', label: 'path' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_ssl_name',
        params: [{ primitive: 'string', label: 'name' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_ssl_password_file',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
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
        key: 'proxy_ssl_server_name',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_ssl_session_reuse',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_ssl_trusted_certificate',
        params: [{ primitive: 'string', label: 'file' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_ssl_verify',
        params: [{ primitive: ['on', 'off'] }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_ssl_verify_depth',
        params: [{ primitive: 'number' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_store',
        params: [{ primitive: 'string', label: 'on | off | string' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_store_access',
        params: [{ primitive: 'string', label: 'users:permissions ...' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_temp_file_write_size',
        params: [{ primitive: 'string', label: 'size' }],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
    {
        key: 'proxy_temp_path',
        params: [
            { primitive: 'string', label: 'path' },
            { primitive: 'number', label: 'level1', optional: true },
            { primitive: 'number', label: 'level2', optional: true },
            { primitive: 'number', label: 'level3', optional: true }
        ],
        context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location
    },
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