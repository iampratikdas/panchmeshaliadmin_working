export interface SiblingEvent {
    id: string;
    name: string;
    timePeriod: {
        startDate: string;
        endDate: string;
    };
}

export interface Event {
    id: string;
    name: string;
    duration: number; // in days
    timePeriod: {
        startDate: string;
        endDate: string;
    };
    siblingEvent?: SiblingEvent;
    resultsReleased: boolean;
    teamMembers: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateEventData {
    name: string;
    duration: number;
    timePeriod: {
        startDate: string;
        endDate: string;
    };
    hasSiblingEvent: boolean;
    siblingEventName?: string;
    siblingTimePeriod?: {
        startDate: string;
        endDate: string;
    };
    resultsReleased: boolean;
    teamMembers: string[];
}
