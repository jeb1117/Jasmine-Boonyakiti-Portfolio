/**
 * General structure of the teaching assistant.
 *
 */

#include <pthread.h>
#include <stdio.h>
#include <time.h>
#include <errno.h>
#include <string.h>
#include <stdlib.h>
#include "ta.h"

void *ta_loop(void *param)
{
	   while(1)
    {

        sem_wait(&STUDENT);
        while(1)
        {

        pthread_mutex_lock(&mutex);


            if(waitTime == 0) 
            {

                pthread_mutex_unlock(&mutex);
		        sem_wait(&STUDENT); 
                break;

            }
        printf("I am the TA\n");
        --waitTime; 

        pthread_mutex_unlock(&mutex);
        printf("TA is busy. Current waiting students:  %d\n", waitTime);

        sem_post(&TA);


        srandom((unsigned)time(NULL)); 
		sleep_time = (int)((random() % MAX_SLEEP_TIME) + 1);
		help_student(sleep_time);

        
        }
       
    }	
}
