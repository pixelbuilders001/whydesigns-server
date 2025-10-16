import { config } from '../config/env.config';

interface CalendarEventData {
  summary: string;
  description: string;
  startDateTime: Date;
  endDateTime: Date;
  attendeeEmail: string;
  attendeeName: string;
  meetingLink?: string;
}

interface CalendarEvent {
  eventId: string;
  meetingLink?: string;
}

export class GoogleCalendarService {
  private calendar: any;
  private isConfigured: boolean;
  private googleApi: any;

  constructor() {
    this.isConfigured = false;
    this.calendar = null;
    this.googleApi = null;
    // Don't initialize in constructor - do it lazily on first use
  }

  private async initializeCalendar(): Promise<boolean> {
    // If already tried to initialize, return cached result
    if (this.calendar !== null || this.isConfigured === true) {
      return this.isConfigured;
    }

    try {
      // Check if Google Calendar credentials are configured
      if (
        !config.GOOGLE_CLIENT_EMAIL ||
        !config.GOOGLE_PRIVATE_KEY ||
        !config.GOOGLE_CALENDAR_ID
      ) {
        console.warn('⚠️  Google Calendar not configured. Calendar events will not be created.');
        console.warn('   To enable Google Calendar integration, set these environment variables:');
        console.warn('   - GOOGLE_CLIENT_EMAIL');
        console.warn('   - GOOGLE_PRIVATE_KEY');
        console.warn('   - GOOGLE_CALENDAR_ID');
        this.isConfigured = false;
        return false;
      }

      // Lazy load googleapis only when needed
      const { google } = await import('googleapis');
      this.googleApi = google;

      // Initialize Google Calendar API with service account
      const auth = new google.auth.JWT({
        email: config.GOOGLE_CLIENT_EMAIL,
        key: config.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });

      this.calendar = google.calendar({ version: 'v3', auth });
      this.isConfigured = true;
      console.log('✅ Google Calendar integration initialized');
      return true;
    } catch (error: any) {
      console.error('❌ Failed to initialize Google Calendar:', error?.message || error);
      this.isConfigured = false;
      return false;
    }
  }

  async createEvent(eventData: CalendarEventData): Promise<CalendarEvent | null> {
    // Initialize on first use
    await this.initializeCalendar();

    if (!this.isConfigured) {
      console.log('⏭️  Skipping Google Calendar event creation (not configured)');
      return null;
    }

    try {
      const { summary, description, startDateTime, endDateTime, attendeeEmail, attendeeName } =
        eventData;

      const event = {
        summary,
        description,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: config.TIMEZONE || 'UTC',
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: config.TIMEZONE || 'UTC',
        },
        attendees: [
          {
            email: attendeeEmail,
            displayName: attendeeName,
            responseStatus: 'needsAction',
          },
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'email', minutes: 60 }, // 1 hour before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
        conferenceData: eventData.meetingLink
          ? undefined
          : {
              createRequest: {
                requestId: `booking-${Date.now()}`,
                conferenceSolutionKey: { type: 'hangoutsMeet' },
              },
            },
      };

      const response = await this.calendar.events.insert({
        calendarId: config.GOOGLE_CALENDAR_ID,
        resource: event,
        conferenceDataVersion: eventData.meetingLink ? 0 : 1,
        sendUpdates: 'all', // Send email notifications to attendees
      });

      console.log('✅ Google Calendar event created:', response.data.id);

      return {
        eventId: response.data.id,
        meetingLink:
          eventData.meetingLink ||
          response.data.conferenceData?.entryPoints?.[0]?.uri ||
          response.data.hangoutLink,
      };
    } catch (error: any) {
      console.error('❌ Failed to create Google Calendar event:', error.message);
      // Don't throw error - booking should still be created even if calendar fails
      return null;
    }
  }

  async updateEvent(
    eventId: string,
    eventData: Partial<CalendarEventData>
  ): Promise<boolean> {
    // Initialize on first use
    await this.initializeCalendar();

    if (!this.isConfigured) {
      console.log('⏭️  Skipping Google Calendar event update (not configured)');
      return false;
    }

    try {
      const updateData: any = {};

      if (eventData.summary) updateData.summary = eventData.summary;
      if (eventData.description) updateData.description = eventData.description;
      if (eventData.startDateTime && eventData.endDateTime) {
        updateData.start = {
          dateTime: eventData.startDateTime.toISOString(),
          timeZone: config.TIMEZONE || 'UTC',
        };
        updateData.end = {
          dateTime: eventData.endDateTime.toISOString(),
          timeZone: config.TIMEZONE || 'UTC',
        };
      }

      await this.calendar.events.patch({
        calendarId: config.GOOGLE_CALENDAR_ID,
        eventId,
        resource: updateData,
        sendUpdates: 'all',
      });

      console.log('✅ Google Calendar event updated:', eventId);
      return true;
    } catch (error: any) {
      console.error('❌ Failed to update Google Calendar event:', error.message);
      return false;
    }
  }

  async cancelEvent(eventId: string): Promise<boolean> {
    // Initialize on first use
    await this.initializeCalendar();

    if (!this.isConfigured) {
      console.log('⏭️  Skipping Google Calendar event cancellation (not configured)');
      return false;
    }

    try {
      await this.calendar.events.delete({
        calendarId: config.GOOGLE_CALENDAR_ID,
        eventId,
        sendUpdates: 'all', // Notify attendees
      });

      console.log('✅ Google Calendar event cancelled:', eventId);
      return true;
    } catch (error: any) {
      console.error('❌ Failed to cancel Google Calendar event:', error.message);
      return false;
    }
  }

  async getEvent(eventId: string): Promise<any | null> {
    // Initialize on first use
    await this.initializeCalendar();

    if (!this.isConfigured) {
      return null;
    }

    try {
      const response = await this.calendar.events.get({
        calendarId: config.GOOGLE_CALENDAR_ID,
        eventId,
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to get Google Calendar event:', error.message);
      return null;
    }
  }
}

export default new GoogleCalendarService();
