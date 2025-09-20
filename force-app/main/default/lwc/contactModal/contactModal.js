import { LightningElement, api, track } from 'lwc';

export default class ContactModal extends LightningElement {
    @track isModalOpen = false;

    @track name = '';
    @track email = '';
    @track phone = '';
    @track message = '';

    @api carId; // passed from parent
    @api variantId;
    @api color;

    // Open modal (call from parent)
    @api openModal() {
        this.isModalOpen = true;
    }

    // Close modal
    closeModal() {
        this.isModalOpen = false;
    }

    // Handle input changes
    handleChange(event) {
        const field = event.target.dataset.id;
        if (field === 'name') this.name = event.target.value;
        else if (field === 'email') this.email = event.target.value;
        else if (field === 'phone') this.phone = event.target.value;
        else if (field === 'message') this.message = event.target.value;
    }

    // Submit form (we’ll connect Apex later)
    submitForm() {
        if (!this.name || !this.email || !this.phone) {
            alert('Please fill all required fields');
            return;
        }

        // Dispatch event to parent LWC with form data
        const selectedEvent = new CustomEvent('submitdeal', {
            detail: {
                carId: this.carId,
                variantId: this.variantId,
                color: this.color,
                name: this.name,
                email: this.email,
                phone: this.phone,
                message: this.message
            }
        });
        this.dispatchEvent(selectedEvent);
        this.closeModal();
    }
}
