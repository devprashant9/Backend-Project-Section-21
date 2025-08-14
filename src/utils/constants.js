// Available Roles
export const UserRolesEnum = {
    ADMIN: "admin",
    PROJECT_ADMIN: "projectAdmin",
    MEMBER: "member"
}

// Available Roles Values
export const AvailableUserRoles = Object.values(UserRolesEnum);

// Available Statuses
export const TaskStatusEnum = {
    TODO: "todo",
    In_PROGRESS: "inProgress",
    DONE: "done",
}

// Available Statuses Values
export const AvailableTaskStatuses = Object.values(TaskStatusEnum);