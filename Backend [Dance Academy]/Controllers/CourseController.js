const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Course    = require("../Models/CourseModel");
const Student   = require("../Models/StudentModel");
const Attendance = require("../Models/AttendanceModel");
const Fee       = require("../Models/FeeModel");

const getCourses = async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 }).lean();
        res.json({ data: courses });
    } catch {
        res.status(500).json({ message: "Error fetching courses" });
    }
};

const createCourse = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { name, instructor, schedule, fee } = req.body;
        const course = await Course.create({ name, instructor, schedule, fee: Number(fee) });
        res.status(201).json({ message: "Course created", data: course });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "A course with this name already exists." });
        }
        res.status(500).json({ message: "Error creating course" });
    }
};

const updateCourse = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid ID" });
        const { name, instructor, schedule, fee } = req.body;

        // { new: false } returns the pre-update doc — gets oldName in a single round-trip
        const oldCourse = await Course.findByIdAndUpdate(
            req.params.id,
            { name, instructor, schedule, fee: Number(fee) },
            { new: false, runValidators: true }
        ).lean();
        if (!oldCourse) return res.status(404).json({ message: "Course not found" });

        const oldName = oldCourse.name;

        // Propagate course name change to all dependent string fields
        if (oldName !== name) {
            await Promise.all([
                Student.updateMany({ course: oldName }, { course: name }),
                Attendance.updateMany({ course: oldName }, { course: name }),
                Fee.updateMany({ course: oldName }, { course: name }),
            ]);
        }

        const course = await Course.findById(req.params.id).lean();
        res.json({ message: "Course updated", data: course });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "A course with this name already exists." });
        }
        res.status(500).json({ message: "Error updating course" });
    }
};

const deleteCourse = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid ID" });
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });

        // Check for enrolled students before deletion
        const studentCount = await Student.countDocuments({ course: course.name });
        if (studentCount > 0) {
            return res.status(409).json({
                message: `Cannot delete: ${studentCount} student(s) are enrolled in "${course.name}". Re-enroll or remove them first.`,
            });
        }

        // Cascade-delete orphaned attendance and fee records tied to this course name
        await Promise.all([
            Attendance.deleteMany({ course: course.name }),
            Fee.deleteMany({ course: course.name }),
            course.deleteOne(),
        ]);

        res.json({ message: "Course deleted" });
    } catch {
        res.status(500).json({ message: "Error deleting course" });
    }
};

module.exports = { getCourses, createCourse, updateCourse, deleteCourse };
