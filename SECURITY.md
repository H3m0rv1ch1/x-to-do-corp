# Security Policy

## 🔒 Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## 🛡️ Reporting a Vulnerability

We take the security of X To-Do Corp seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please Do Not:
- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it has been addressed

### Please Do:
1. **Email us** at security@example.com (replace with your email)
2. **Include details**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
3. **Allow time** for us to respond (typically within 48 hours)

### What to Expect:
- **Acknowledgment** within 48 hours
- **Regular updates** on our progress
- **Credit** in the security advisory (if desired)
- **Fix timeline** typically within 7-14 days for critical issues

## 🔐 Security Measures

### Data Storage
- **Local Only**: All data stored locally in browser (IndexedDB)
- **No Cloud**: No data transmitted to external servers
- **No Tracking**: Zero analytics or tracking scripts
- **No Cookies**: No third-party cookies

### Dependencies
- Regular dependency updates
- Automated vulnerability scanning
- Minimal dependency footprint

### Best Practices
- TypeScript for type safety
- Input sanitization
- XSS prevention
- CSRF protection (when applicable)

## 🚨 Known Security Considerations

### Browser Storage
- Data stored in IndexedDB is accessible to anyone with physical access to the device
- Users should use device-level encryption for sensitive data
- Browser extensions can potentially access stored data

### Recommendations for Users
1. **Use device encryption** (BitLocker, FileVault, etc.)
2. **Lock your device** when not in use
3. **Use browser profiles** for separation
4. **Regular backups** of exported data
5. **Keep browser updated** for latest security patches

## 🔄 Security Updates

Security updates will be released as:
- **Critical**: Immediate patch release
- **High**: Within 7 days
- **Medium**: Next minor version
- **Low**: Next major version

## 📋 Security Checklist for Contributors

When contributing code, ensure:
- [ ] No hardcoded secrets or API keys
- [ ] Input validation for user data
- [ ] Proper error handling (no sensitive info in errors)
- [ ] Dependencies are up to date
- [ ] No eval() or dangerous functions
- [ ] Proper Content Security Policy headers
- [ ] XSS prevention in user-generated content

## 🔍 Vulnerability Disclosure Policy

We follow responsible disclosure:
1. **Report received** - Acknowledged within 48 hours
2. **Investigation** - Verify and assess impact
3. **Fix developed** - Create and test patch
4. **Release** - Deploy fix to production
5. **Disclosure** - Public advisory after fix is deployed

## 📞 Contact

For security concerns:
- **Email**: security@example.com
- **PGP Key**: [Link to PGP key if available]

For general questions:
- **GitHub Issues**: For non-security bugs
- **Discussions**: For feature requests

## 🏆 Hall of Fame

We recognize security researchers who help keep X To-Do Corp secure:

<!-- List of contributors who reported security issues -->
- *No reports yet*

---

Thank you for helping keep X To-Do Corp and its users safe!
