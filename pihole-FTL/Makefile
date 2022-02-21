include $(TOPDIR)/rules.mk

PKG_NAME:=pihole-FTL
PKG_VERSION:=5.14
PKG_RELEASE:=1

PKG_SOURCE_URL:=https://codeload.github.com/pi-hole/FTL/tar.gz/v$(PKG_VERSION)?
PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_HASH:=351efed2624e82baf6ddcf76face610bfb0e9ff87f8fa3d89ad30c0f8684d264
PKG_BUILD_DIR:=$(BUILD_DIR)/FTL-$(PKG_VERSION)

PKG_LICENSE:=EUPL
PKG_LICENSE_FILES:=LICENSE

PKG_INSTALL:=1
PKG_BUILD_PARALLEL:=1
PKG_CONFIG_DEPENDS:= CONFIG_pihole_FTL_ipset \
	CONFIG_pihole_FTL_conntrack \
	CONFIG_pihole_FTL_shared_sqlite \
	CONFIG_pihole_FTL_idn2 \
	CONFIG_pihole_FTL_readline

PKG_ASLR_PIE_REGULAR:=0
CMAKE_INSTALL:=1
PKG_USE_NINJA:=0
PKG_RELRO:=0
PKG_FORTIFY_SOURCE:=0
PKG_SSP:=0
include $(INCLUDE_DIR)/package.mk
include $(INCLUDE_DIR)/cmake.mk

TARGET_LDFLAGS += $(if $(CONFIG_USE_GLIBC),-pthread)

#CMAKE_OPTIONS += -DSTATIC=true -DCMAKE_VERBOSE_MAKEFILE=ON
CMAKE_OPTIONS += \
	$(if $(CONFIG_pihole_FTL_ipset),-DIPSET_SUPPORT=ON,-DIPSET_SUPPORT=OFF) \
	$(if $(CONFIG_pihole_FTL_conntrack),-DCONNTRACK_SUPPORT=ON,-DCONNTRACK_SUPPORT=OFF) \
	$(if $(CONFIG_pihole_FTL_shared_sqlite),-DSHARED_SQLITE=ON,-DSHARED_SQLITE=OFF) \
	$(if $(CONFIG_pihole_FTL_idn2),-DUSE_LIBIDN2=ON,-DUSE_LIBIDN2=OFF) \
	$(if $(CONFIG_pihole_FTL_readline),-DUSE_READLINE=ON,-DUSE_READLINE=OFF)

export FTL_BRANCH=openwrt
export FTL_VERSION=v$(PKG_VERSION)

# KERNEL_EXT4_FS_SECURITY is needed if using linux capabilities (setcap/getcap)
define Package/pihole-FTL
  SECTION:=regae
  CATEGORY:=regae
  TITLE:=The Pi-hole FTL engine
  URL:=https://pi-hole.net/
  DEPENDS:=pihole +uci +libuci +libubus +libnettle +USE_GLIBC:librt \
	+pihole_FTL_ipset:kmod-ipt-ipset \
	+pihole_FTL_conntrack:libnetfilter-conntrack \
	+pihole_FTL_readline:libreadline \
	+pihole_FTL_shared_sqlite:libsqlite3 \
	$(if $(CONFIG_pihole_FTL_idn2),+libidn2,+libidn)
  CONFLICTS:=dnsmasq-full dnsmasq-dhcpv6
  PROVIDES:=dnsmasq
  USERID:=pihole=454:pihole=454
endef

define Package/pihole-FTL/description
  FTLDNS™ (pihole-FTL) provides an interactive API and also generates statistics for Pi-hole®'s Web interface.
endef

define Package/pihole-FTL/conffiles
/etc/config/pihole
/etc/dnsmasq.conf
endef

define Package/pihole-FTL/config
menu "pihole-FTL Compile Configuration"
	if PACKAGE_pihole-FTL
		config pihole_FTL_ipset
			bool "Build with IPset support."
			default y
		config pihole_FTL_conntrack
			bool "Build with Conntrack support."
			default n
		config pihole_FTL_idn2
			bool "Build with IDN2."
			default n
		config pihole_FTL_shared_sqlite
			bool "Use shared library sqlite3."
			default n
		config pihole_FTL_readline
			bool "Build with Readline support."
			help
			  Enable Readline support for pihole-FTL sqlite3-cli and lua
			default y
	endif
endmenu
endef

define Package/pihole-FTL/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(CP) $(PKG_INSTALL_DIR)/usr/bin/pihole-FTL $(1)/usr/bin/
	$(INSTALL_DIR) $(1)/usr/sbin
	$(LN) ../bin/pihole-FTL $(1)/usr/sbin/dnsmasq
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_DATA) ./files/dnsmasq.conf $(1)/etc/dnsmasq.conf
	$(INSTALL_DIR) $(1)/etc/dnsmasq.d
	$(INSTALL_DIR) $(1)/etc/pihole
	$(INSTALL_DATA) ./files/adlists.list $(1)/etc/pihole/
	$(INSTALL_DATA) ./files/pihole-FTL.conf $(1)/etc/pihole/pihole-FTL.conf.default
	$(INSTALL_DATA) ./files/setupVars.conf $(1)/etc/pihole/setupVars.conf.default
	$(INSTALL_DATA) ./files/macvendor.db $(1)/etc/pihole/
	$(INSTALL_DATA) ./files/whitelist.txt $(1)/etc/pihole/
	$(INSTALL_DIR) $(1)/etc/capabilities
	$(INSTALL_DATA) ./files/pihole-FTL.json $(1)/etc/capabilities
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/pihole-FTL.init $(1)/etc/init.d/pihole-FTL
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_BIN) ./files/pihole.config $(1)/etc/config/pihole
	$(INSTALL_DIR) $(1)/etc/hotplug.d/dhcp
	$(INSTALL_DIR) $(1)/etc/hotplug.d/neigh
	$(INSTALL_DIR) $(1)/etc/hotplug.d/ntp
	$(INSTALL_DIR) $(1)/etc/hotplug.d/tftp
	$(INSTALL_DATA) ./files/piholesec.hotplug $(1)/etc/hotplug.d/ntp/25-piholesec
	$(INSTALL_DIR) $(1)/usr/share/pihole
	$(INSTALL_DATA) ./files/rfc6761.conf $(1)/usr/share/pihole/
	$(INSTALL_DATA) ./files/dhcpbogushostname.conf $(1)/usr/share/pihole/
	$(INSTALL_DIR) $(1)/usr/lib/pihole
	$(INSTALL_BIN) ./files/dhcp-script.sh $(1)/usr/lib/pihole/dhcp-script.sh
	$(INSTALL_DIR) $(1)/usr/share/acl.d
	$(INSTALL_DATA) ./files/pihole_acl.json $(1)/usr/share/acl.d/
	$(INSTALL_DIR) $(1)/usr/share/pihole
	$(INSTALL_DATA) ./files/trust-anchors.conf $(1)/usr/share/pihole
endef

$(eval $(call BuildPackage,pihole-FTL))
