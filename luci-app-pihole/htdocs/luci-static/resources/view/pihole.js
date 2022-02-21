'use strict';
'require fs';
'require ui';
'require rpc';
'require uci';
'require view';
'require poll';
'require form';
'require tools.widgets as widgets';

return view.extend({
	render: function() {
		var m, s, o;

		m = new form.Map('pihole', _('FTLDNS&trade;'));
		m.description = _("<abbr title=\"pihole\'s Faster Than Light daemon\">FTL</abbr>DNS&trade; (pihole-FTL) offers DNS services within the Pi-hole® project. " +
			  "It provides blazing fast DNS and DHCP services. It can also provide TFTP and more as the resolver part based on the popular dnsmasq. " +
			  "Furthermore, FTL offers an interactive API where extensive network analysis data and statistics may be queried. " +
			  "<br><a href=\"https://docs.pi-hole.net/ftldns/configfile/\" target=\"_blank\">FTL Config Documentation</a>.");

		s = m.section(form.TypedSection, 'pihole');
		s.tab("dns", _("DNS Settings"));
		s.tab("database", _("Database"));
		s.tab("statistic", _("Statistic Settings"));
		s.tab("other", _("Others"));
		s.tab("debug", _("Debug"), _("<p style=\"text-align: center;\">PLEASE MAKE SURE THERE IS ENOUGH MEMORY AND DISK SPACE BEFORE ENABLING THESE OPTIONS.</p>"));
		s.anonymous = true;
		s.addremove = false;

		o = s.taboption("dns", form.ListValue, 'blockingmode', _("Blocking Mode"), _("How should FTL reply to blocked queries?"));
		o.value("null", _("NULL"));
		o.value("ip-nodata-aaaa", _("IPv4 and IPv6 NODATA"));
		o.value("ip", _("IP Addresses"));
		o.value("nxdomain", _("NXDOMAIN"));
		o.default = 'null';

		o = s.taboption('dns', form.Value, 'block_ipv4',
			_('Block IPv4 Address'),
			_('Override Replied IP address for blocked A queries.<br>Leave this empty, FTL will determines the address of the interface a query arrived on and uses this address.'));

		o.optional = true;
		o.rmempty = false;
		o.depends('blockingmode', 'ip');
		o.depends('blockingmode', 'ip-nodata-aaaa');
		o.placeholder = '192.168.1.1';

		o = s.taboption('dns', form.Value, 'block_ipv6',
			_('Block IPv6 Address'),
			_('Override Replied IP address for blocked AAAA queries.'));

		o.optional = true;
		o.rmempty = false;
		o.depends('blockingmode', 'ip');
		o.placeholder = '::1';

		o = s.taboption('dns', form.Flag, 'cname_deep_inspect',
			_('CNAME Deep Inspect'),
			_('Use this option to disable deep CNAME inspection. This might be beneficial for very low-end devices'));
		o.optional = true;

		o = s.taboption('dns', form.Flag, 'block_esni',
			_('Block ESNI'),
			_('This prevents the SNI from being used to determine which websites users are visiting.'));
		o.optional = true;
		o.default = o.enabled;

		o = s.taboption('dns', form.Flag, 'edns0_ecs',
			_('EDNS0 ECS'),
			_('Should we overwrite the query source when client information is provided through EDNS0 client subnet (ECS) information? This allows Pi-hole to obtain client IPs even if they are hidden behind the NAT of a router.'));
		o.optional = true;
		o.default = o.enabled;

		o = s.taboption('dns', form.Flag, 'mozilla_canary',
			_('Mozilla Canary'),
			_('Should Pi-hole always replies with NXDOMAIN to A and AAAA queries of use-application-dns.net to disable Firefox automatic DNS-over-HTTP?'));
		o.optional = true;
		o.default = o.enabled;

		o = s.taboption('dns', form.Flag, 'block_icloud_pr',
			_('Block iCloud Private Relay'),
			_('Should Pi-hole always replies with NXDOMAIN to A and AAAA queries of mask.icloud.com and mask-h2.icloud.com to disable Apple\'s iCloud Private Relay to prevent Apple devices from bypassing Pi-hole?'));
		o.optional = true;
		o.default = o.enabled;

		o = s.taboption('dns', form.Value, 'rate_limit',
			_('Rate Limit'),
			_('Rate-limited queries are answered with a REFUSED reply and not further processed by FTL. (Queries/Minute)'));
		o.optional = true;
		o.rmempty = false;
		o.placeholder = _('1000/60');

		o = s.taboption('dns', form.Value, 'block_ttl',
			_('Block TTL'),
			_('This settings allows users to select a value different from the dnsmasq config option local-ttl.'));
		o.optional = true;
		o.rmempty = false;
		o.datatype = 'and(uinteger)';
		o.placeholder = _('2');

		o = s.taboption('database', form.Value, 'dbfile',
			_('FTL Database'),
			_('Specify the path and filename of FTL\'s SQLite3 long-term database.<br>Empty this value disables the database altogether.'));
		o.optional = true;
		o.rmempty = false;
		o.placeholder = _('/var/lib/pihole/pihole-FTL.db');

		o = s.taboption('database', form.Value, 'gravitydb',
			_('Gravity Database'),
			_('Specify path and filename of FTL\'s SQLite3 gravity database.<br>This database contains all domains relevant for Pi-hole\'s DNS blocking'));
		o.optional = true;
		o.rmempty = false;
		o.placeholder = _('/var/lib/pihole/gravity.db');

		o = s.taboption('database', form.Value, 'dbinterval',
			_('DB Interval (minutes)'),
			_('if running on SD card or SSD, recommended to set DBINTERVAL value to at least 60'));
		o.optional = true;
		o.datatype = 'and(uinteger,min(1),max(3600))';
		o.placeholder = 360;

		o = s.taboption('database', form.Flag, 'dbimport',
			_('DB Import'),
			_('Should FTL load information from the database on startup to be aware of the most recent history?'));
		o.optional = true;
		o.default = o.enabled;

		o = s.taboption('database', form.Value, 'maxdbdays',
			_('Database Days'),
			_('How long should queries be stored in the database? Setting this to 0 disables the database'));
		o.optional = true;
		o.rmempty = false;
		o.datatype = 'and(uinteger,min(1),max(365))';
		o.placeholder = 365;

		o = s.taboption("statistic", form.ListValue, 'privacylevel', _("Privacy Level"));
		o.value("0", _("Show Everything"));
		o.value("1", _("Hide Domains"));
		o.value("2", _("Hide Domains and Clients"));
		o.value("3", _("Anonymous Everyting"));
		o.default = '0';

		o = s.taboption('statistic', form.Value, 'maxlogage',
			_('Statistic Age (hour)'),
			_('Up to how many hours of queries should be imported from the database and logs?'));
		o.optional = true;
		o.rmempty = false;
		o.datatype = 'and(uinteger,min(1),max(24))';
		o.placeholder = 24;

		o = s.taboption('statistic', form.Flag, 'analyze_only_a_and_aaaa',
			_('Analyze Only A & AAAA'),
			_('Should FTL only analyze A and AAAA queries?'));
		o.optional = true;

		o = s.taboption('statistic', form.Flag, 'aaaa_query_analysis',
			_('Analyze AAAA Queries'),
			_('Should FTL analyze AAAA queries? The DNS server will handle AAAA queries the same way, reglardless of this setting.'));
		o.optional = true;

		o = s.taboption('statistic', form.Flag, 'show_dnssec',
			_('Show DNSSEC'),
			_('Should FTL analyze and include automatically generated DNSSEC queries in the Query Log?'));
		o.optional = true;
		o.default = o.disabled;

		s.taboption('statistic', form.Flag, 'ignore_localhost',
			_('Ignore Localhost'),
			_('Should FTL ignore queries coming from the local machine?'));
		o.optional = true;

		o = s.taboption('other', form.Flag, 'resolve_ipv4',
			_('Resolve IPv4'),
			_('Should FTL try to resolve IPv4 addresses to host names?'));
		o.optional = true;

		o = s.taboption('other', form.Flag, 'resolve_ipv4',
			_('Resolve IPv6'),
			_('Should FTL try to resolve IPv6 addresses to host names?'));
		o.optional = true;

		o = s.taboption('other', form.Value, 'ftlport',
			_('FTL Socket Port'),
			_('On which port should FTL be listening?'));
		o.optional = true;
		o.rmempty = false;
		o.datatype = 'and(uinteger,min(1),max(65534))';
		o.placeholder = 4711;

		o = s.taboption("other", form.ListValue, 'pihole_ptr', _("Pihole PTR"), _("Controls whether and how FTL will reply with for address for which a local interface exists."));
		o.value("pi.hole", _("pi.hole"));
		o.value("hostnamefqdn", _("Hostname FQDN"));
		o.value("hostname", _("Hostname"));
		o.value("none", _("None"));
		o.rmempty = false;
		o.default = 'hostname';

		o = s.taboption("other", form.ListValue, 'socket_listening', _("Socket Listening"), _("Listen only for local socket connections or permit all connections."));
		o.value("local", _("Local"));
		o.value("all", _("All"));
		o.default = 'local';

		o = s.taboption("other", form.ListValue, 'refresh_hostnames', _("Refresh Hostnames"), _("Change how hourly PTR requests are made to check for changes in client and upstream server hostnames."));
		o.value("ipv4", _("IPv4"));
		o.value("all", _("All"));
		o.value("unknown", _("Unknown"));
		o.value("none", _("None"));
		o.default = 'ipv4';

		o = s.taboption('other', form.Flag, 'parse_arp_cache',
			_('Parse ARP Cache'),
			_('This setting can be used to disable ARP cache processing. When disabled, client identification and the network table will stop working reliably.'));
		o.optional = true;
		o.default = o.enabled;

		o = s.taboption('other', form.Flag, 'names_from_netdb',
			_('Names from Database'),
			_('Control whether FTL should use the fallback option to try to obtain client names from network table.'));
		o.optional = true;
		o.default = o.enabled;

		o = s.taboption('other', form.Flag, 'check_load',
			_('Check System Load'),
			_('FTL warns about excessive load when the 15 minute system load average exceeds the number of cores.'));
		o.optional = true;
		o.default = o.enabled;

		o = s.taboption('other', form.Value, 'check_shmem',
			_('Check Shared Memory'),
			_('FTL warns if the shared-memory usage exceeds this value (percentage).'));
		o.optional = true;
		o.rmempty = false;
		o.datatype = 'and(uinteger,min(1),max(100))';
		o.placeholder = 90;

		o = s.taboption('other', form.Value, 'check_disk',
			_('Check Disk Usage'),
			_('FTL warns if the disk-usage usage exceeds this value (percentage).'));
		o.optional = true;
		o.rmempty = false;
		o.datatype = 'and(uinteger,min(1),max(100))';
		o.placeholder = 90;

		o = s.taboption('debug', form.Flag, 'debug_all',
			_('Debug All'),
			_('Enable all debug flags. If this value is enabled, all other debug options are ignored.'));
		o.optional = true;
		o.default = o.disabled;

		o = s.taboption('debug', form.Flag, 'debug_database',
			_('Debug Database'),
			_('Print debugging information about database actions. This prints performed SQL statements as well as some general information such as the time it took to store the queries and how many have been saved to the database.'));
		o.optional = true;
		o.default = o.disabled;

		o = s.taboption('debug', form.Flag, 'debug_networking',
			_('Debug Networking'),
			_('Prints a list of the detected interfaces on the startup of pihole-FTL. Also, prints whether these interfaces are IPv4 or IPv6 interfaces.'));
		o.optional = true;
		o.default = o.disabled;

		o = s.taboption('debug', form.Flag, 'debug_edns0',
			_('Debug EDNS0'),
			_('Print debugging information about received EDNS(0) data.'));
		o.optional = true;
		o.default = o.disabled;

		o = s.taboption('debug', form.Flag, 'debug_locks',
			_('Debug Locks'),
			_('Print information about shared memory locks. Messages will be generated when waiting, obtaining, and releasing a lock.'));
		o.optional = true;
		o.default = o.disabled;

		o = s.taboption('debug', form.Flag, 'debug_queries',
			_('Debug Queries'),
			_('Print extensive query information (domains, types, replies, etc.). This has always been part of the legacy debug mode of pihole-FTL.'));
		o.optional = true;
		o.default = o.disabled;

		o = s.taboption('debug', form.Flag, 'debug_flags',
			_('Debug Flags'),
			_('Print flags of queries received by the DNS hooks. Only effective when DEBUG_QUERIES is enabled as well.'));
		o.optional = true;
		o.default = o.disabled;

		o = s.taboption('debug', form.Flag, 'debug_shmem',
			_('Debug Shared Memory (SHMEM)'),
			_('Print information about shared memory buffers. Messages are either about creating or enlarging shmem objects or string injections.'));
		o.optional = true;
		o.default = o.disabled;

		o = s.taboption('debug', form.Flag, 'debug_gc',
			_('Debug Garbage Collection (GC)'),
			_('Print information about garbage collection (GC): What is to be removed, how many have been removed and how long did GC take.'));
		o.optional = true;
		o.default = o.disabled;

		o = s.taboption('debug', form.Flag, 'debug_arp',
			_('Debug ARP'),
			_('Print information about ARP table processing: How long did parsing take, whether read MAC addresses are valid, and if the macvendor.db file exists.'));
		o.optional = true;
		o.default = o.disabled;

		o = s.taboption('debug', form.Flag, 'debug_regex',
			_('Debug Regex'),
			_('Controls if FTLDNS should print extended details about regex matching into pihole-FTL.log.'));
		o.optional = true;
		o.default = o.disabled;

		o = s.taboption('debug', form.Flag, 'debug_api',
			_('Debug API'),
			_('Print extra debugging information during telnet API calls. Currently only used to send extra information when getting all queries.'));
		o.optional = true;
		o.default = o.disabled;

		o = s.taboption('debug', form.Flag, 'debug_overtime',
			_('Debug Overtime'),
			_('Print information about overTime memory operations, such as initializing or moving overTime slots.'));
		o.optional = true;
		o.default = o.disabled;

		o = s.taboption('debug', form.Flag, 'debug_status',
			_('Debug Status'),
			_('Print information about status changes for individual queries. This can be useful to identify unexpected unknown queries.'));
		o.optional = true;
		o.default = o.disabled;

		o = s.taboption('debug', form.Flag, 'debug_caps',
			_('Debug Capabilities'),
			_('Print information about capabilities granted to the pihole-FTL process. The current capabilities are printed on receipt of SIGHUP (killall -HUP pihole-FTL).'));
		o.optional = true;
		o.default = o.disabled;

		o = s.taboption('debug', form.Flag, 'debug_vectors',
			_('Debug Vectors'),
			_('FTL uses dynamically allocated vectors for various tasks. This config option enables extensive debugging information such as information about allocation, referencing, deletion, and appending.'));
		o.optional = true;
		o.default = o.disabled;

		o = s.taboption('debug', form.Flag, 'debug_resolver',
			_('Debug Resolver'),
			_('Extensive information about hostname resolution like which DNS servers are used in the first and second hostname resolving tries (only affecting internally generated PTR queries).'));
		o.optional = true;
		o.default = o.disabled;

		o = s.taboption('debug', form.Flag, 'debug_clients',
			_('Debug Clients'),
			_('Log various important client events such as change of interface (e.g., client switching from WiFi to wired or VPN connection), as well as extensive reporting about how clients were assigned to its groups.'));
		o.optional = true;
		o.default = o.disabled;

		o = s.taboption('debug', form.Flag, 'debug_aliasclients',
			_('Debug Alias Clients'),
			_('Log information related to alias-client processing.'));
		o.optional = true;
		o.default = o.disabled;

		o = s.taboption('debug', form.Flag, 'debug_events',
			_('Debug Events'),
			_('Log information regarding FTL\'s embedded event handling queue.'));
		o.optional = true;
		o.default = o.disabled;

		o = s.taboption('debug', form.Flag, 'debug_helper',
			_('Debug Helper'),
			_('Log information about script helpers, e.g., due to dhcp-script.'));
		o.optional = true;
		o.default = o.disabled;

		o = s.taboption('debug', form.Flag, 'debug_extra',
			_('Debug Extra'),
			_('Temporary flag that may print additional information. This debug flag is meant to be used whenever needed for temporary investigations. The logged content may change without further notice at any time.'));
		o.optional = true;
		o.default = o.disabled;

		return m.render();
	}
})
