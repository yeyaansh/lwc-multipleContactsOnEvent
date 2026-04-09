import { LightningElement,track, api,wire } from 'lwc';
import getContactListFromSearchInput from "@salesforce/apex/DataForLookupLWC.getContactListFromSearchInput";
import getLeadListFromSearchInput from "@salesforce/apex/DataForLookupLWC.getLeadListFromSearchInput";
import getAccountListFromSearchInput from "@salesforce/apex/DataForLookupLWC.getAccountListFromSearchInput";
import getCurrentContactDetails from "@salesforce/apex/DataForLookupLWC.getCurrentContactDetails";
import createEvents from "@salesforce/apex/createEventForMultipleContactsOrLeads.createEvents";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class RecordPicker extends LightningElement {

    @api
    recordId;

    currentContactOwnerName;
    currentContactOwnerId;
    searchConLeadInput = '';
    searchAccountInput = '';
    isContactOrLeadSelected = 'contact';
    isContact = true;
    isLead = false;
    isAccount = true;
    startDateTime;
    endDateTime;
    selectedAccountName;
    selectedAccountId;
    isAccountSelectedFromSearch = false;
    disableAccountSearch = false;
    isSubjectOptionOpened = false;
    subjectOptions=[
        {id: '0', label:'Call',value:'Call'},
        {id: '1', label:'Email',value:'Email'},
        {id: '2', label:'Meeting',value:'Meeting'},
        {id: '3', label:'Send Other/Quote',value:'Send Other/Quote'},
        {id: '4', label:'Other',value:'Other'}
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
            this.pillListForSelectedMultipleContactsOrLeads = [...this.pillListForSelectedMultipleContactsOrLeads,{Id: data.Id,contactName: data.Name}];
            this.excludedIdInSearchForLeadOrContact = [...this.excludedIdInSearchForLeadOrContact,data.Id];
            this.currentContactOwnerName = data.OwnerName;
            // id and contact name and ownerID also returned;
            this.currentContactOwnerId = data.OwnerId;
            console.log("CurrentContactOwnerId: ",this.currentContactOwnerId);
            
            
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
            this.subjectSelectedValue = event.target.value;
        }
        

        else if(event.target.name === 'allDayEvent')
        {
            // console.log(event.target);
            this.allDayEvent = event.target.checked;
            console.log('All day event is; '+this.allDayEvent);
        }
        else if(event.target.name === 'location')
        {
            this.location = event.target.value;
        }
        else if(event.target.name === 'startDateTime')
        {
            this.startDateTime = event.target.value;
        }
        else if(event.target.name === 'endDateTime')
        {
            this.endDateTime = event.target.value;
        }
    }


    handleSubjectFocus()
    {
        this.isSubjectOptionOpened = true;
    }

    handleSubjectBlur()
    {
        this.isSubjectOptionOpened = false;
    }

    handleSubjectOptionClicked(event)
    {
        this.subjectSelectedValue = event.currentTarget.dataset.value;
        console.log(this.subjectSelectedValue);
        this.isSubjectOptionOpened = false;
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
                getAccountListFromSearchInput({ searchInput: this.searchAccountInput })
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
        this.selectedAccountId = event.currentTarget.dataset.recordid;
        this.selectedAccountName= event.currentTarget.dataset.accountname;
        let index = event.currentTarget.dataset.index;
        this.accountSearchedOption = [];

        this.searchAccountInput = '';
        this.isAccountSelectedFromSearch=true;
        this.disableAccountSearch = true;



    }
    
    handleSelectedAccountRemove(event)
    {
        event.preventDefault();
        // event.currentTarget;

        this.isAccountSelectedFromSearch = false;
        this.disableAccountSearch = false;

    }

    handleEventSaveButton(event)
    {
        event.preventDefault();
        if(this.startDateTime!='' && this.endDateTime != '' && this.pillListForSelectedMultipleContactsOrLeads.length>0 && this.selectedAccountId != '')
        {
            // call apex method to create event for selected contacts or lead
            createEvents({subject: this.subjectSelectedValue, startDateTime: this.startDateTime, endDateTime: this.endDateTime, isAllDayEvent: this.allDayEvent, contactOrLeadsList: this.excludedIdInSearchForLeadOrContact , relatedToAccount: this.selectedAccountId, assignedTo: this.currentContactOwnerId, location: this.location})
            .then(({message, error, statusCode})=>{

                if(statusCode[0] == '201')
                {
                console.log(message);
                const event = new ShowToastEvent({ title: "Success!", message: message[0], variant: 'success'});
                this.dispatchEvent(event);
            }
            else
                {
                    console.log(message);
                    const event = new ShowToastEvent({ title: message[0], message: error[0], variant: 'error'});
                    this.dispatchEvent(event);
                }
            })
            .catch((error)=>{
                const event = new ShowToastEvent({ title: "Error While Creating Events!", message: 'Something Went Wrong!', variant: 'warning'});
                this.dispatchEvent(event);
                console.log(error);
                
            })
            .finally();
        }

    }



}