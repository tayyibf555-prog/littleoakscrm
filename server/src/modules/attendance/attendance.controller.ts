import { Request, Response } from 'express';
import { attendanceService } from './attendance.service';

export class AttendanceController {
  async getChildrenAttendance(req: Request, res: Response) {
    const date = req.query.date as string | undefined;
    const attendance = await attendanceService.getChildrenAttendance(date);
    res.json(attendance);
  }

  async checkInChild(req: Request, res: Response) {
    const { childId, time } = req.body;
    const record = await attendanceService.checkInChild(childId, time, req.user?.userId);
    res.json(record);
  }

  async checkOutChild(req: Request, res: Response) {
    const { childId, time } = req.body;
    const record = await attendanceService.checkOutChild(childId, time, req.user?.userId);
    res.json(record);
  }

  async updateChildAttendance(req: Request, res: Response) {
    const record = await attendanceService.updateChildAttendance(
      req.params.id as string,
      req.body,
    );
    res.json(record);
  }

  async getChildAttendanceReport(req: Request, res: Response) {
    const { startDate, endDate, childId } = req.query;
    const report = await attendanceService.getChildAttendanceReport(
      startDate as string,
      endDate as string,
      childId as string | undefined,
    );
    res.json(report);
  }

  async getStaffAttendance(req: Request, res: Response) {
    const date = req.query.date as string | undefined;
    const attendance = await attendanceService.getStaffAttendance(date);
    res.json(attendance);
  }

  async checkInStaff(req: Request, res: Response) {
    const { staffId, time } = req.body;
    const record = await attendanceService.checkInStaff(staffId, time);
    res.json(record);
  }

  async checkOutStaff(req: Request, res: Response) {
    const { staffId, time } = req.body;
    const record = await attendanceService.checkOutStaff(staffId, time);
    res.json(record);
  }
}

export const attendanceController = new AttendanceController();
