/* ========================================
   DIGITAL LIBRARY PRO - MEMBERSHIP SYSTEM
   Register / Login / Unique Membership Number
   ======================================== */

class MembershipSystem {
    constructor() {
        this.members = JSON.parse(localStorage.getItem('digitalLibrary_members')) || [];
        this.currentMember = JSON.parse(localStorage.getItem('digitalLibrary_currentMember')) || null;
        this.init();
    }

    init() {
        this.cacheDOM();
        this.attachEvents();
        this.updateUI();
    }

    cacheDOM() {
        this.modal = document.getElementById('memberModal');
        this.memberArea = document.getElementById('memberArea');
        this.loginTab = document.getElementById('loginTab');
        this.registerTab = document.getElementById('registerTab');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.memberLoginForm = document.getElementById('memberLoginForm');
        this.memberRegisterForm = document.getElementById('memberRegisterForm');
        this.openMemberBtn = document.getElementById('openMemberModal');
    }

    attachEvents() {
        // Open modal
        this.openMemberBtn?.addEventListener('click', () => {
            this.modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        // Tab switching
        this.loginTab?.addEventListener('click', () => {
            this.loginTab.classList.add('active');
            this.registerTab.classList.remove('active');
            this.loginForm.classList.add('active');
            this.registerForm.classList.remove('active');
        });
        this.registerTab?.addEventListener('click', () => {
            this.registerTab.classList.add('active');
            this.loginTab.classList.remove('active');
            this.registerForm.classList.add('active');
            this.loginForm.classList.remove('active');
        });

        // Register form submit
        this.memberRegisterForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });

        // Login form submit
        this.memberLoginForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });
    }

    // Generate unique membership number: DLP-YYYY-XXXXX
    generateMembershipNumber() {
        const year = new Date().getFullYear();
        const random = Math.floor(10000 + Math.random() * 90000);
        let number = `DLP-${year}-${random}`;
        // Ensure uniqueness
        while (this.members.find(m => m.membershipNumber === number)) {
            number = `DLP-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
        }
        return number;
    }

    register() {
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirmPassword').value;

        if (!name || !email) {
            return library.showToast('Name and email are required', 'warning');
        }

        // If password is provided, check confirmation
        if (password && password !== confirm) {
            return library.showToast('Passwords do not match', 'error');
        }

        // Check if email already exists
        if (this.members.find(m => m.email === email)) {
            return library.showToast('Email already registered. Please login.', 'warning');
        }

        const membershipNumber = this.generateMembershipNumber();
        const newMember = {
            membershipNumber,
            name,
            email,
            password: password || null, // optional
            registeredAt: new Date().toISOString()
        };

        this.members.push(newMember);
        localStorage.setItem('digitalLibrary_members', JSON.stringify(this.members));

        // Auto login
        this.currentMember = newMember;
        localStorage.setItem('digitalLibrary_currentMember', JSON.stringify(newMember));

        library.showToast(`✅ Registered! Your membership: ${membershipNumber}`, 'success');
        this.modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        this.updateUI();
        this.memberRegisterForm.reset();
    }

    login() {
        const membership = document.getElementById('loginMembership').value.trim();
        const password = document.getElementById('loginPassword').value;

        const member = this.members.find(m => m.membershipNumber === membership);
        if (!member) {
            return library.showToast('Membership number not found', 'error');
        }

        // If member has a password, it must match; if no password, any password (or blank) works
        if (member.password && member.password !== password) {
            return library.showToast('Incorrect password', 'error');
        }

        this.currentMember = member;
        localStorage.setItem('digitalLibrary_currentMember', JSON.stringify(member));
        library.showToast(`Welcome back, ${member.name}!`, 'success');
        this.modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        this.updateUI();
        this.memberLoginForm.reset();
    }

    logout() {
        this.currentMember = null;
        localStorage.removeItem('digitalLibrary_currentMember');
        library.showToast('You have been logged out', 'info');
        this.updateUI();
    }

    updateUI() {
        if (!this.memberArea) return;
        if (this.currentMember) {
            this.memberArea.innerHTML = `
                <div class="member-welcome">
                    <i class="fas fa-user-circle"></i>
                    <span class="member-name">${this.currentMember.name.split(' ')[0]}</span>
                    <button class="btn-logout" id="logoutBtn"><i class="fas fa-sign-out-alt"></i></button>
                </div>
            `;
            document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
        } else {
            this.memberArea.innerHTML = `
                <button class="btn-member" id="openMemberModal">
                    <i class="fas fa-user-circle"></i>
                    <span class="member-name">Login</span>
                </button>
            `;
            // Re-attach event
            document.getElementById('openMemberModal')?.addEventListener('click', () => {
                this.modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }
    }
}

// Initialize membership system
const membership = new MembershipSystem();
window.membership = membership; // global for access from script.js