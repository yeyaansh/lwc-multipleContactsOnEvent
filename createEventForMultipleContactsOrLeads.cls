public class createEventForMultipleContactsOrLeads {

    @AuraEnabled
    public static Map<String,List<String>> createEvents(String subject, String startDateTime, String endDateTime, Boolean isAllDayEvent, List<String> contactOrLeadsList, String relatedToAccount , String assignedTo, String location)
    {            
        
        try {

            Map<String,List<String>> response = new Map<String,List<String>>{ 'message' => new List<String>(), 'error' => new List<String>(), 'statusCode' => new List<String>()};
            String startDateTimeInApexString = startDateTime.replace('T', ' ').replace('Z', '').substring(0, 19);
            String endDateTimeInApexString = endDateTime.replace('T', ' ').replace('Z', '').substring(0, 19);

            DateTime startDateTimeInApex = DateTime.valueOfGmt(startDateTimeInApexString);
            DateTime endDateTimeInApex = DateTime.valueOfGmt(endDateTimeInApexString);


            if(startDateTime!='' && endDateTime !='' && contactOrLeadsList.size()>0  && assignedTo!='')
                {
                List<Event> eventsList = new List<Event>();
                for(String singleId : contactOrLeadsList)
                {

                Event singleEvent = new Event();
                singleEvent.Subject = subject;
                singleEvent.StartDateTime = startDateTimeInApex;
                singleEvent.EndDateTime = endDateTimeInApex;
                singleEvent.IsAllDayEvent  = isAllDayEvent;
                singleEvent.WhoId = singleId;
                singleEvent.WhatId = relatedToAccount;
                singleEvent.OwnerId = assignedTo;
                singleEvent.Location = location;

                eventsList.add(singleEvent);
            
                }


        List<String> errorsList = new List<String>();
        List<Database.SaveResult> results = Database.insert(eventsList,true);
        for(Database.SaveResult singleResult : results)
        {
            if(singleResult.isSuccess())
            {
                // nothing to execute
            }

            else {
                for(Database.Error error : singleResult.getErrors())
                {
                    errorsList.add(error.getMessage());
                }
            }
        }

        if(errorsList.size()<1)
        {
            response.put('message', new List<String>{'Events Created Succesfully!'} );
            response.put('statusCode', new List<String>{'201'});
            return response;
        }

        else {
            response.put('message', new List<String>{'Error while creating Events!'});
            response.put('error', errorsList);
            response.put('statusCode', new List<String>{'500'});
            return response;
        }} 
            
    }catch(Exception e) {
                // System.debug(e.getMessage());

                    return new Map<String,List<String>>{ 'message' => new List<String>{'Error Creating Events -> Please FIX it!'}, 'error' => new List<String>{e.getMessage()}, 'statusCode' => new List<String>{'422'}}; 
            }
            return null;
    }

        
}