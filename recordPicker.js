import { LightningElement,track, api,wire } from 'lwc';
import getContactListFromSearchInput from "@salesforce/apex/DataForLookupLWC.getContactListFromSearchInput";
import getLeadListFromSearchInput from "@salesforce/apex/DataForLookupLWC.getLeadListFromSearchInput";
import getAccountListFromSearchInput from "@salesforce/apex/DataForLookupLWC.getAccountListFromSearchInput";
import getCurrentContactDetails from "@salesforce/apex/DataForLookupLWC.getCurrentContactDetails";

export default class RecordPicker extends LightningElement {

    @api
    recordId;

    currentOwnerName;
    searchConLeadInput = '';
    searchAccountInput = '';
    isContactOrLeadSelected = 'contact';
    isContact = true;
    isLead = false;
    isAccount = true;
    startDateTime;
    endDateTime;

    subjectOptions=[
        {label:'Call',value:'call'},
        {label:'Email',value:'email'},
        {label:'Meeting',value:'meeting'},
        {label:'Send Other/Quote',value:'send other/quote'},
        {label:'Other',value:'other'}
    ]

    subjectSelectedValue='';
    allDayEvent = false;
    location = '';

    @track pillListForSelectedMultipleContactsOrLeads=[];

    @track
    leadSearchedOption=[];
    @track
    contactSearchedOption=[];
    @track
    accountSearchedOption=[];

    excludedIdInSearchForLeadOrContact=[];

    connectedCallback() {
        let start = new Date();
        this.startDateTime = start.toISOString();
        this.endDateTime = new Date(start.getTime() + (1000*60*60)).toISOString();
    }

    @wire(getCurrentContactDetails,{recordId : '$recordId' })
    getOwnerName({data, error}){
        if(data)
        {
            console.log('Inside the wire > getCurrentContactDetails > data');
            console.log(data);
            this.currentOwnerName = data[0].Owner.Name;
            
        }

        else if(error)
        {
            console.log('Inside the wire > getCurrentContactDetails > error');
            console.log(error);
        }

    }


        handleValueChange(event) {
        event.preventDefault();
        
        if(event.target.name === 'subject')
        {
            this.subject = event.detail.value;
        }
        else if(event.target.name === 'allDayEvent')
        {
            this.allDayEvent = event.target.value;
        }

        else if(event.target.name === 'location')
        {
            this.location = event.target.value;
        }
    }


    handleConLeadSelect(event) {
        event.preventDefault();
        this.isContactOrLeadSelected = event.detail.value;
        if(this.isContactOrLeadSelected === 'contact')
        {
                    this.isContact = true;
                    this.isLead = false;
                    this.leadSearchedOption = [];
                    this.pillListForSelectedMultipleContactsOrLeads = [];
                    this.excludedIdInSearchForLeadOrContact = [];
        }

        else if(this.isContactOrLeadSelected === 'lead')
        {
                    this.isContact = false;
                    this.isLead = true;
                    this.contactSearchedOption = [];
                    this.pillListForSelectedMultipleContactsOrLeads = [];
                    this.excludedIdInSearchForLeadOrContact = [];
        }
    }


    handleSelectedContactLeadRemove(event) {
        console.log("before: exclude Array");
        console.log(JSON.stringify(this.excludedIdInSearchForLeadOrContact));

        
        let index = event.target.dataset.index;
        let recordId = event.target.dataset.recordid;
        console.log(recordId);
        
        this.pillListForSelectedMultipleContactsOrLeads.splice(event.target.dataset.index,1);
        this.excludedIdInSearchForLeadOrContact =  this.excludedIdInSearchForLeadOrContact.filter(Id => Id !== recordId);

        console.log("after: exclude array");
        console.log(JSON.stringify(this.excludedIdInSearchForLeadOrContact));
        
    }


    onSearchInputChange(event) {
        event.preventDefault();

        if (event.target.name === 'conLead') {
            this.searchConLeadInput = event.target.value;
            if (this.searchConLeadInput.trim() != '') {
                if (this.isContactOrLeadSelected === 'contact') {
                    getContactListFromSearchInput({ searchInput: this.searchConLeadInput, recordsToExcludeFromSearch : this.excludedIdInSearchForLeadOrContact }) 
                        .then((result) => {
                            console.log('Inside ContactListSearchInput > result');
                            console.log(result);
                        if(result.length < 1)
                        {
                            this.contactSearchedOption = [];
                        }
                        else
                        {
                            this.contactSearchedOption = result;
                        }
                            
                        })
                        .catch((error) => {
                            console.log('Inside ContactListSearchInput -> error');
                            console.log(error);
                        })
                        .finally(() => {

                        })
                }

                else if (this.isContactOrLeadSelected === 'lead') {
                    getLeadListFromSearchInput({ searchInput: this.searchConLeadInput , recordsToExcludeFromSearch : this.excludedIdInSearchForLeadOrContact})
                        .then((result) => {
                            console.log('Inside LeadListSearchInput > result');
                            console.log(result);
                            if(result.length < 1)
                        {
                            this.leadSearchedOption = [];
                        }
                        else
                        {
                            this.leadSearchedOption = result;
                        }
                        })
                        .catch((error) => {
                            console.log('Inside LeadListSearchInput > error');
                            console.log(error);
                        })
                        .finally(() => {

                        })

                }
            }

            else if(this.searchConLeadInput === '')
            {
                this.contactSearchedOption = [];
                this.leadSearchedOption = [];
            }

        }
        else if (event.target.name === 'account') {
            this.searchAccountInput = event.target.value;
            if (this.searchAccountInput.trim() != '') {
                getAccountListFromSearchInput({ searchInput: this.searchConLeadInput })
                    .then((result) => {
                        console.log('Inside AccountListSearchInput > result');
                        console.log(result);
                        if(result.length < 1)
                        {
                            this.accountSearchedOption = [];
                        }
                        else
                        {
                            this.accountSearchedOption = result;
                        }
                        
                    })
                    .catch((error) => {
                        console.log('Inside AccountListSearchInput > error');
                        console.log(error);
                    })
                    .finally(() => {

                    })
            }

            else if(this.searchAccountInput === '')
            {
                this.accountSearchedOption = [];
            }
        }


    }


    // handleContactsSelection -> After Searching @writtenby-Yeyaansh
    handleContactsSelection(event)
    {
        event.preventDefault();
        console.log(event.currentTarget);
        
        let recordIdOfSelectedContact = event.currentTarget.dataset.recordid;
        let contactName = event.currentTarget.dataset.contactname;
        let parentAccountName = event.currentTarget.dataset.parentaccountname;
        let index = event.currentTarget.dataset.index;
        
        this.excludedIdInSearchForLeadOrContact = [...this.excludedIdInSearchForLeadOrContact,recordIdOfSelectedContact];
        this.pillListForSelectedMultipleContactsOrLeads = [...this.pillListForSelectedMultipleContactsOrLeads,{Id:recordIdOfSelectedContact,contactName,parentAccountName}];

        if(this.contactSearchedOption.length > 0)
        {
            this.contactSearchedOption.splice(index,1);
        }
        

    }
    // handleLeadsSelection -> After Searching
    handleLeadsSelection(event)
    {
        event.preventDefault();
        let recordIdOfSelectedLead = event.currentTarget.dataset.recordid;
        let leadTitle = event.currentTarget.dataset.leadtitle;       
        let leadName = event.currentTarget.dataset.leadname;
        let index = event.currentTarget.dataset.index;

        this.excludedIdInSearchForLeadOrContact = [...this.excludedIdInSearchForLeadOrContact,recordIdOfSelectedLead];
        this.pillListForSelectedMultipleContactsOrLeads = [...this.pillListForSelectedMultipleContactsOrLeads,{Id:recordIdOfSelectedLead,leadTitle,leadName}];

        if(this.leadSearchedOption.length > 0)
        {
            this.leadSearchedOption.splice(index,1);
        }


    }
    handleAccountsSelection(event)
    {
        event.preventDefault();
        let recordIdOfSelectedContact = event.currentTarget.dataset.recordid;
        let accountName = event.currentTarget.dataset.accountname;
        let index = event.currentTarget.dataset.index;

    }


    handleEventSaveButton(event)
    {
        event.preventDefault();

    }


}