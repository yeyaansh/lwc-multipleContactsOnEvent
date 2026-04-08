public with sharing class DataForLookupLWC {


    // Wrapper Class For Contact
    public class ContactWrapper{
        @AuraEnabled public String Id;
        @AuraEnabled public String Title;
        // @AuraEnabled public String FirstName;
        // @AuraEnabled public String LastName;
        @AuraEnabled public String Name;
        @AuraEnabled public String AccountId;
        @AuraEnabled public String AccountName;

        public ContactWrapper(String Id, String Title, String FirstName, String LastName, String AccountId, String AccountName)
        {
        this.Id = Id;
        this.Title = Title;
        // this.FirstName = FirstName;
        // this.LastName = LastName;
        this.Name = FirstName+' '+LastName;
        this.AccountId = AccountId;
        this.AccountName = AccountName;
        }
        
    }



    // Wrapper Class for Lead
    public class LeadWrapper{
        @AuraEnabled public String Id;
        @AuraEnabled public String Title;
        // @AuraEnabled public String FirstName;
        // @AuraEnabled public String LastName;
        @AuraEnabled public String Name;

        public LeadWrapper(String Id, String Title, String FirstName, String LastName)
        {
        this.Id = Id;
        this.Title = Title;
        // this.FirstName = FirstName;
        // this.LastName = LastName;
        this.Name = FirstName+' '+LastName;
        }
        
    }


    // Wrapper Class for Account
    public class AccountWrapper{
        @AuraEnabled public String Id;
        @AuraEnabled public String Name;

        public AccountWrapper(String Id, String Name)
        {
        this.Id = Id;
        this.Name = Name;
        }
        
    }



    // Apex Class for Contact Search
    @AuraEnabled
    public static List<ContactWrapper> getContactListFromSearchInput(String searchInput, List<String> recordsToExcludeFromSearch)
    {
        String searchParams = '%'+searchInput+'%';
        // List<Contact> searchedContactList = [select id, firstName, lastName, title, account.name, accountId from contact where name like : searchParams limit 5]; @writtenby-Yeyaansh
        List<ContactWrapper> contactWrapperList = new List<ContactWrapper>();
        for(Contact singleContact : [select id, firstName, lastName, title, account.name, accountId from contact where id not in : recordsToExcludeFromSearch and name like : searchParams limit 5])
        {
            ContactWrapper singleContactWrapper = new ContactWrapper(singleContact.id , singleContact.title ,singleContact.firstName , singleContact.lastName, singleContact.accountId,  singleContact.Account.Name );
            contactWrapperList.add(singleContactWrapper);
        }
        return contactWrapperList;
    } 

    // Apex Class for Lead Search
    @AuraEnabled
    public static List<LeadWrapper> getLeadListFromSearchInput(String searchInput, List<String> recordsToExcludeFromSearch)
    {
        String searchParams = '%'+searchInput+'%';
        List<LeadWrapper> leadWrapperList = new List<LeadWrapper>();
        for(Lead singleLead : [select id, firstName, lastName, title from lead  where id not in : recordsToExcludeFromSearch and  name like : searchParams limit 5])
        {
            LeadWrapper singleLeadWrapper = new LeadWrapper(singleLead.id , singleLead.title ,singleLead.firstName , singleLead.lastName);
            leadWrapperList.add(singleLeadWrapper);
        }
        return leadWrapperList;
    } 


    // Apex Class for Account Search
    @AuraEnabled
    public static List<AccountWrapper> getAccountListFromSearchInput(String searchInput)
    {
        String searchParams = '%'+searchInput+'%';
        List<AccountWrapper> accountWrapperList = new List<AccountWrapper>();
        for(Account singleAccount : [select id, name from account where name like : searchParams limit 5])
        {
            AccountWrapper singleAccountWrapper = new AccountWrapper(singleAccount.id , singleAccount.name);
            accountWrapperList.add(singleAccountWrapper);
        }
        return accountWrapperList;
    }

    // Apex Class for Currently Opened Contact Details
    @AuraEnabled(cacheable=true)
    public static List<Contact> getCurrentContactDetails(String recordId)
    {
        return [select id, name, owner.name from contact where id =: recordId limit 1];
    }

}