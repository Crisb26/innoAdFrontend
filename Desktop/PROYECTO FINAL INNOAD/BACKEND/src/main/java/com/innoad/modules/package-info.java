/**
 * Modular Architecture Package
 * 
 * This package contains business modules following Domain-Driven Design principles.
 * Each module is independent and communicates through service interfaces.
 * 
 * Modules:
 * - auth: Authentication and authorization (users, roles, permissions, sessions)
 * - campaigns: Campaign management
 * - content: Content management (videos, images, files)
 * - screens: Screen and device management (Raspberry Pi)
 * - stats: Statistics and analytics
 * - ia: AI agents and conversations
 * - admin: Administration and system configuration
 * 
 * Module Structure:
 * - domain: Entities and value objects
 * - service: Business logic
 * - repository: Data access
 * - controller: REST endpoints
 * - dto: Data transfer objects
 * 
 * Rules:
 * 1. Modules should NOT import other module's repositories directly
 * 2. Cross-module communication only through services
 * 3. Shared code goes in 'shared' package
 * 4. Each module can be extracted to microservice if needed
 */
package com.innoad.modules;
