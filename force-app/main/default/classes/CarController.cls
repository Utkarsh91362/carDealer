public without sharing class CarController {
    @AuraEnabled(cacheable=true)
    public static List<Cars__c> getCars() {
        return [SELECT Id, Name, Description__c, Base_Price__c, Warranty_Years__c, Services__c  
                FROM Cars__c LIMIT 10];
    }
}
