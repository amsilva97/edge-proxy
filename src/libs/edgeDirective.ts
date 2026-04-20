export type EdgePrimitive =
    | 'context' // denotes a nested block with its own set of directives
    | 'on_off' // on | off
    | 'time' // nginx time string, e.g. 500ms, 1h
    | 'size' // nginx size string, e.g. 4k, 10m
    | 'number' // integer
    | 'path' // filesystem path or glob
    | 'string' // arbitrary freeform string / identifier
    | 'address' // IP address, CIDR block, hostname, or unix: socket
    | { enum: readonly string[] }; // fixed set of named options


export type EdgeSlot = {
    one_of: EdgePrimitive[];
    optional?: boolean;
    label?: string;
};

export enum EdgeDirectiveContext {
    all = 0b1111_1111,
    events = 0b0000_0001,
    main = 0b0000_0010,
    http = 0b0000_0100,
    server = 0b0000_1000,
    location = 0b0001_0000,
}

export interface EdgeDirective {
    name: string;
    slots: EdgeSlot[];
    context: EdgeDirectiveContext;
    multi?: boolean;
}

export type EdgeBlockData = [EdgeDirective['name'], ...EdgeBlockData[]];

export const EdgeDirectives: EdgeDirective[] = [
    { name: 'custom_context', slots: [{ one_of: ['context'] }], context: EdgeDirectiveContext.all },
    { name: 'custom_directive', slots: [{ one_of: ['string'], label: 'value' }], context: EdgeDirectiveContext.all, multi: true },
    // Core functionality
    { name: 'accept_mutex', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.events },
    { name: 'accept_mutex_delay', slots: [{ one_of: ['time'] }], context: EdgeDirectiveContext.events },
    { name: 'daemon', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.main },
    { name: 'debug_connection', slots: [{ one_of: ['address', 'string'], label: 'address | CIDR | unix:' }], context: EdgeDirectiveContext.events, multi: true },
    { name: 'debug_points', slots: [{ one_of: [{ enum: ['abort', 'stop'] }] }], context: EdgeDirectiveContext.main },
    { name: 'env', slots: [{ one_of: ['string'], label: 'variable[=value]' }], context: EdgeDirectiveContext.main, multi: true },
    { name: 'error_log', slots: [{ one_of: ['path', { enum: ['stderr'] }], label: 'file' }, { one_of: [{ enum: ['debug', 'info', 'notice', 'warn', 'error', 'crit', 'alert', 'emerg'] }], label: 'level', optional: true }], context: EdgeDirectiveContext.main, multi: true },
    { name: 'include', slots: [{ one_of: ['path'], label: 'file | mask' }], context: EdgeDirectiveContext.all },
    { name: 'load_module', slots: [{ one_of: ['path'], label: 'file' }], context: EdgeDirectiveContext.main },
    { name: 'lock_file', slots: [{ one_of: ['path'], label: 'file' }], context: EdgeDirectiveContext.main },
    { name: 'master_process', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.main },
    { name: 'multi_accept', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.events },
    { name: 'pcre_jit', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.main },
    { name: 'pid', slots: [{ one_of: ['path'], label: 'file' }], context: EdgeDirectiveContext.main },
    { name: 'ssl_engine', slots: [{ one_of: ['string'], label: 'device' }], context: EdgeDirectiveContext.main },
    { name: 'ssl_object_cache_inheritable', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.main },
    { name: 'stall_threshold', slots: [{ one_of: ['time'] }], context: EdgeDirectiveContext.events },
    { name: 'thread_pool', slots: [{ one_of: ['string'], label: 'name' }, { one_of: ['number'], label: 'threads' }, { one_of: ['number'], label: 'max_queue', optional: true }], context: EdgeDirectiveContext.main },
    { name: 'timer_resolution', slots: [{ one_of: ['time'], label: 'interval' }], context: EdgeDirectiveContext.main },
    { name: 'use', slots: [{ one_of: [{ enum: ['select', 'poll', 'kqueue', 'epoll', 'eventport', '/dev/poll'] }], label: 'method' }], context: EdgeDirectiveContext.events },
    { name: 'user', slots: [{ one_of: ['string'], label: 'user' }, { one_of: ['string'], label: 'group', optional: true }], context: EdgeDirectiveContext.main },
    { name: 'worker_aio_requests', slots: [{ one_of: ['number'] }], context: EdgeDirectiveContext.events },
    { name: 'worker_connections', slots: [{ one_of: ['number'] }], context: EdgeDirectiveContext.events },
    { name: 'worker_cpu_affinity', slots: [{ one_of: ['string', { enum: ['auto'] }], label: 'cpumask... | auto [cpumask]' }], context: EdgeDirectiveContext.main },
    { name: 'worker_priority', slots: [{ one_of: ['number'] }], context: EdgeDirectiveContext.main },
    { name: 'worker_processes', slots: [{ one_of: ['number', { enum: ['auto'] }] }], context: EdgeDirectiveContext.main },
    { name: 'worker_rlimit_core', slots: [{ one_of: ['size'] }], context: EdgeDirectiveContext.main },
    { name: 'worker_rlimit_nofile', slots: [{ one_of: ['number'] }], context: EdgeDirectiveContext.main },
    { name: 'worker_shutdown_timeout', slots: [{ one_of: ['time'] }], context: EdgeDirectiveContext.main },
    { name: 'working_directory', slots: [{ one_of: ['path'], label: 'directory' }], context: EdgeDirectiveContext.main },
    // ngx_http_core_module
    { name: 'absolute_redirect', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'aio', slots: [{ one_of: ['on_off', 'string'], label: 'on | off | threads[=pool]' }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'aio_write', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'alias', slots: [{ one_of: ['path'], label: 'path' }], context: EdgeDirectiveContext.location },
    { name: 'auth_delay', slots: [{ one_of: ['time'], label: 'time' }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'chunked_transfer_encoding', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'client_body_buffer_size', slots: [{ one_of: ['size'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'client_body_in_file_only', slots: [{ one_of: [{ enum: ['on', 'clean', 'off'] }] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'client_body_in_single_buffer', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'client_body_temp_path', slots: [{ one_of: ['path'], label: 'path' }, { one_of: ['number'], label: 'level1', optional: true }, { one_of: ['number'], label: 'level2', optional: true }, { one_of: ['number'], label: 'level3', optional: true }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'client_body_timeout', slots: [{ one_of: ['time'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'client_header_buffer_size', slots: [{ one_of: ['size'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server },
    { name: 'client_header_timeout', slots: [{ one_of: ['time'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server },
    { name: 'client_max_body_size', slots: [{ one_of: ['size'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'connection_pool_size', slots: [{ one_of: ['size'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server },
    { name: 'default_type', slots: [{ one_of: ['string'], label: 'mime-type' }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'directio', slots: [{ one_of: ['size', { enum: ['off'] }] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'directio_alignment', slots: [{ one_of: ['size'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'disable_symlinks', slots: [{ one_of: [{ enum: ['off', 'on', 'if_not_owner'] }, 'string'], label: 'off | on | if_not_owner [from=part]' }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'early_hints', slots: [{ one_of: ['string'], label: 'string ...' }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location, multi: true },
    { name: 'error_page', slots: [{ one_of: ['string'], label: 'code ... [=[response]] uri' }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location, multi: true },
    { name: 'etag', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'http', slots: [{ one_of: ['context'] }], context: EdgeDirectiveContext.main },
    { name: 'if_modified_since', slots: [{ one_of: [{ enum: ['off', 'exact', 'before'] }] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'ignore_invalid_headers', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server },
    { name: 'internal', slots: [], context: EdgeDirectiveContext.location },
    { name: 'keepalive_disable', slots: [{ one_of: [{ enum: ['none', 'msie6', 'safari'] }] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'keepalive_min_timeout', slots: [{ one_of: ['time'], label: 'timeout' }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'keepalive_requests', slots: [{ one_of: ['number'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'keepalive_time', slots: [{ one_of: ['time'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'keepalive_timeout', slots: [{ one_of: ['time'], label: 'timeout' }, { one_of: ['time'], label: 'header_timeout', optional: true }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'large_client_header_buffers', slots: [{ one_of: ['number'], label: 'number' }, { one_of: ['size'], label: 'size' }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server },
    { name: 'limit_except', slots: [{ one_of: ['context'] }], context: EdgeDirectiveContext.location, multi: true },
    { name: 'limit_rate', slots: [{ one_of: ['size'], label: 'rate' }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'limit_rate_after', slots: [{ one_of: ['size'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'lingering_close', slots: [{ one_of: [{ enum: ['off', 'on', 'always'] }] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'lingering_time', slots: [{ one_of: ['time'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'lingering_timeout', slots: [{ one_of: ['time'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'listen', slots: [{ one_of: ['address', 'string'], label: 'address[:port] | port | unix:path' }], context: EdgeDirectiveContext.server, multi: true },
    { name: 'location', slots: [{ one_of: ['context'] }], context: EdgeDirectiveContext.server | EdgeDirectiveContext.location, multi: true },
    { name: 'log_not_found', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'log_subrequest', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'max_headers', slots: [{ one_of: ['number'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server },
    { name: 'max_ranges', slots: [{ one_of: ['number'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'merge_slashes', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server },
    { name: 'msie_padding', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'msie_refresh', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'open_file_cache', slots: [{ one_of: [{ enum: ['off'] }, 'string'], label: 'off | max=N [inactive=time]' }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'open_file_cache_errors', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'open_file_cache_min_uses', slots: [{ one_of: ['number'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'open_file_cache_valid', slots: [{ one_of: ['time'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'output_buffers', slots: [{ one_of: ['number'], label: 'number' }, { one_of: ['size'], label: 'size' }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'port_in_redirect', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'postpone_output', slots: [{ one_of: ['size'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'read_ahead', slots: [{ one_of: ['size'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'recursive_error_pages', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'request_pool_size', slots: [{ one_of: ['size'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server },
    { name: 'reset_timedout_connection', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'resolver', slots: [{ one_of: ['address', 'string'], label: 'address ... [valid=time] [ipv4=on|off] [ipv6=on|off]' }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location, multi: true },
    { name: 'resolver_timeout', slots: [{ one_of: ['time'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'satisfy', slots: [{ one_of: [{ enum: ['all', 'any'] }] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'send_lowat', slots: [{ one_of: ['size'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'send_timeout', slots: [{ one_of: ['time'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'sendfile', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'sendfile_max_chunk', slots: [{ one_of: ['size'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'server', slots: [{ one_of: ['context'] }], context: EdgeDirectiveContext.http, multi: true },
    { name: 'server_name', slots: [{ one_of: ['string'], label: 'name ...' }], context: EdgeDirectiveContext.server, multi: true },
    { name: 'server_name_in_redirect', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'server_names_hash_bucket_size', slots: [{ one_of: ['size'] }], context: EdgeDirectiveContext.http },
    { name: 'server_names_hash_max_size', slots: [{ one_of: ['size'] }], context: EdgeDirectiveContext.http },
    { name: 'server_tokens', slots: [{ one_of: ['on_off', { enum: ['build'] }, 'string'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'subrequest_output_buffer_size', slots: [{ one_of: ['size'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'tcp_nodelay', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'tcp_nopush', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'try_files', slots: [{ one_of: ['string'], label: 'file ... uri | =code' }], context: EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'types', slots: [{ one_of: ['context'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server | EdgeDirectiveContext.location },
    { name: 'types_hash_bucket_size', slots: [{ one_of: ['size'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server },
    { name: 'types_hash_max_size', slots: [{ one_of: ['size'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server },
    { name: 'underscores_in_headers', slots: [{ one_of: ['on_off'] }], context: EdgeDirectiveContext.http | EdgeDirectiveContext.server },
    { name: 'variables_hash_bucket_size', slots: [{ one_of: ['size'] }], context: EdgeDirectiveContext.http },
    { name: 'variables_hash_max_size', slots: [{ one_of: ['size'] }], context: EdgeDirectiveContext.http },
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