public with sharing class CarDetailController {

    // Fetch a single car by Id
    @AuraEnabled(cacheable=true)
    public static Cars__c getCarById(Id carId) {
        return [
            SELECT Id, Name, Base_Price__c, Fuel_Consumption__c, Seating_Capacity__c,
                   Alloy_Wheels__c, Description__c, Services__c, Warranty_Years__c
            FROM Cars__c
            WHERE Id = :carId
            LIMIT 1
        ];
    }

    // Fetch all variants of a given car
    @AuraEnabled(cacheable=true)
    public static List<Variant__c> getVariantsByCar(Id carId) {
        return [
            SELECT Id, Name, Features__c, Price__c
            FROM Variant__c
            WHERE Car_Lookup__c = :carId
            ORDER BY Name
        ];
    }

    // Fetch inventory records for a given car
    // Includes Color_URL__c so the LWC can show the car image per color
    @AuraEnabled(cacheable=true)
    public static List<Inventory__c> getInventoryByCar(Id carId) {
        return [
            SELECT Id, Color__c, Quantity__c, Variant__c, Color_URL__c
            FROM Inventory__c
            WHERE Car__c = :carId
        ];
    }
}
