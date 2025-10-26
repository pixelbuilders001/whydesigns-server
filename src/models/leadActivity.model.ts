import mongoose, { Document, Schema } from 'mongoose';

export interface ILeadActivity extends Document {
  leadId: mongoose.Types.ObjectId;
  counselorId: mongoose.Types.ObjectId;
  activityType: 'contacted' | 'follow_up' | 'meeting_scheduled' | 'meeting_completed' | 'interested' | 'not_interested' | 'converted' | 'closed' | 'other';
  remarks: string;
  activityDate: Date;
  nextFollowUpDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const leadActivitySchema = new Schema<ILeadActivity>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead ID is required'],
      index: true,
    },
    counselorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Counselor ID is required'],
      index: true,
    },
    activityType: {
      type: String,
      enum: {
        values: ['contacted', 'follow_up', 'meeting_scheduled', 'meeting_completed', 'interested', 'not_interested', 'converted', 'closed', 'other'],
        message: '{VALUE} is not a valid activity type',
      },
      required: [true, 'Activity type is required'],
      index: true,
    },
    remarks: {
      type: String,
      required: [true, 'Remarks are required'],
      trim: true,
      minlength: [5, 'Remarks must be at least 5 characters'],
      maxlength: [2000, 'Remarks cannot exceed 2000 characters'],
    },
    activityDate: {
      type: Date,
      required: [true, 'Activity date is required'],
      default: Date.now,
      index: true,
    },
    nextFollowUpDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Compound indexes for efficient queries
leadActivitySchema.index({ leadId: 1, activityDate: -1 });
leadActivitySchema.index({ leadId: 1, isActive: 1 });
leadActivitySchema.index({ counselorId: 1, activityDate: -1 });

export default mongoose.model<ILeadActivity>('LeadActivity', leadActivitySchema);
