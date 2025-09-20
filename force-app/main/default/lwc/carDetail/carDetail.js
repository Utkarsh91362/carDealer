import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import getCarById from '@salesforce/apex/CarDetailController.getCarById';
import getInventoryByCar from '@salesforce/apex/CarDetailController.getInventoryByCar';

export default class CarDetail extends LightningElement {
    @track car;
    @track inventory = [];
    carId; // will get from URL
    carImageUrl = '';

    // Get carId from URL
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            const carIdFromUrl = currentPageReference.state.c__carId;
            if (carIdFromUrl && carIdFromUrl !== this.carId) {
                this.carId = carIdFromUrl;
                console.log('CarId from URL:', this.carId);
            }
        }
    }

    // Fetch car details
    @wire(getCarById, { carId: '$carId' })
    wiredCar({ data, error }) {
        if (data) {
            this.car = data;
            console.log('Car fetched:', data);
        } else if (error) {
            console.error('Error fetching car:', error);
        }
    }

    // Fetch inventory to get default color image
    @wire(getInventoryByCar, { carId: '$carId' })
    wiredInventory({ data, error }) {
        if (data) {
            console.log('Inventory fetched:', data);

            this.inventory = data;

            // Log all fields for each inventory record
            data.forEach(inv => {
                console.log('Inventory record details:', JSON.stringify(inv, null, 2));
            });

            // Set default image: white color
            const whiteInventory = data.find(inv => inv.Color__c === 'White');
            console.log('White color inventory record:', whiteInventory);

            if (whiteInventory) {
                this.carImageUrl = whiteInventory.Color_URL__c;
                console.log('Default car image URL:', this.carImageUrl);
            } else {
                console.warn('No white color inventory found!');
            }
        } else if (error) {
            console.error('Error fetching inventory:', error);
        }
    }

    // Optional: log when clicking a color (future use)
    handleColorClick(event) {
        const inventoryId = event.currentTarget.dataset.id;
        console.log('Clicked inventory record ID:', inventoryId);
    }
}
