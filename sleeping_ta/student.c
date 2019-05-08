/**
 * General structure of a student.
 *
 */

#include <pthread.h>
#include <stdio.h>
#include <time.h>
#include <errno.h>
#include <string.h>
#include <stdlib.h>
#include "ta.h"

void *student_loop(void *param)
{
	int number = *((int *)param);
	while(1)
	{
		srandom((unsigned)time(NULL));
        sleep_time = (int)((random() % MAX_SLEEP_TIME) + 1);
        programming(sleep_time);

		printf("Student %d needs help from the TA\n", number);
		
		pthread_mutex_lock(&mutex);
		pthread_mutex_unlock(&mutex);

		if(waitTime < MAX_WAITING_STUDENTS)		//Student tried to sit on a chair.
		{
			if(waitTime == 0)		//If student sits on first empty chair, wake up the TA.
				sem_post(&STUDENT);
			else
				printf("Student %d sat on a chair waiting for the TA to finish. \n", waitTime);

            // locks 
            pthread_mutex_lock(&mutex);
            ++waitTime;
			printf("Student sat on chair.Chairs Remaining: %d\n", 3 - NUM_OF_SEATS);
            // unlocks
            pthread_mutex_unlock(&mutex);

			sem_post(&STUDENT);		//Student leaves his/her chair.
			printf("\t Student %d is getting help from the TA. \n", number);
			sem_wait(&TA);		//Student waits to go next.
			printf("Student %d left TA room.\n", number);
		}
		else 
			printf("Student %d will return at another time. \n", number);
			//If student didn't find any chair to sit on.
	}
	
}
