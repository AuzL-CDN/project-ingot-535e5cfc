export const SECURITY_PRODUCTS = {
  'TPM': [
    'TPM 1.2',
    'TPM 2.0',
    'fTPM (Firmware TPM)',
    'PTT (Platform Trust Technology)',
    'Other'
  ],
  'Secure Boot': [
    'UEFI Secure Boot Enabled',
    'Legacy BIOS (No Secure Boot)',
    'Other'
  ],
  'BitLocker/Encryption': [
    'BitLocker (Windows)',
    'FileVault (macOS)',
    'LUKS (Linux)',
    'VeraCrypt',
    'DiskCryptor',
    'PGP Whole Disk Encryption',
    'McAfee Complete Data Protection',
    'Sophos SafeGuard',
    'Symantec Endpoint Encryption',
    'Other'
  ],
  'Antivirus': [
    'Windows Defender',
    'McAfee Endpoint Security',
    'Norton Security',
    'Symantec Endpoint Protection',
    'Trend Micro',
    'Kaspersky',
    'Bitdefender',
    'ESET NOD32',
    'Sophos',
    'CrowdStrike Falcon',
    'Carbon Black',
    'SentinelOne',
    'Webroot',
    'Avast Business',
    'AVG Business',
    'F-Secure',
    'Panda Security',
    'Other'
  ],
  'Firewall': [
    'Windows Defender Firewall',
    'pfSense',
    'Fortinet FortiGate',
    'Cisco ASA',
    'Palo Alto Networks',
    'SonicWall',
    'Sophos XG Firewall',
    'Check Point',
    'WatchGuard',
    'Barracuda',
    'Juniper Networks',
    'Hardware-based (Managed by Network Team)',
    'Other'
  ],
  'VPN': [
    'Cisco AnyConnect',
    'Palo Alto GlobalProtect',
    'Fortinet FortiClient',
    'OpenVPN',
    'WireGuard',
    'Pulse Secure',
    'SonicWall NetExtender',
    'Check Point Mobile',
    'Windows Built-in VPN',
    'NordVPN Teams',
    'ExpressVPN',
    'Pritunl',
    'Other'
  ],
  'Password Protection': [
    'Windows Hello',
    'BitLocker PIN',
    'BIOS/UEFI Password',
    'Local Account Password',
    'Domain-managed (Active Directory)',
    'Azure AD',
    'Multi-factor Authentication (MFA)',
    'Okta',
    'Duo Security',
    'Other'
  ],
  'Biometric Auth': [
    'Fingerprint Scanner',
    'Facial Recognition (Windows Hello)',
    'Iris Scanner',
    'Smart Card Reader',
    'FIDO2 Security Key',
    'YubiKey',
    'Other'
  ]
} as const;

export const SECURITY_CATEGORIES = Object.keys(SECURITY_PRODUCTS) as Array<keyof typeof SECURITY_PRODUCTS>;
