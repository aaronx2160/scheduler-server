/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80026
 Source Host           : localhost:3306
 Source Schema         : scheduler

 Target Server Type    : MySQL
 Target Server Version : 80026
 File Encoding         : 65001

 Date: 27/02/2023 06:48:56
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for agents
-- ----------------------------
DROP TABLE IF EXISTS `agents`;
CREATE TABLE `agents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Records of agents
-- ----------------------------
BEGIN;
INSERT INTO `agents` VALUES (1, 'Aaron', 'sophos');
INSERT INTO `agents` VALUES (2, 'Kristina', 'sophos');
INSERT INTO `agents` VALUES (3, 'Bradley', 'sophos');
COMMIT;

-- ----------------------------
-- Table structure for remotes
-- ----------------------------
DROP TABLE IF EXISTS `remotes`;
CREATE TABLE `remotes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticketNum` int DEFAULT NULL,
  `agentName` varchar(255) DEFAULT NULL,
  `halifaxTime` varchar(255) DEFAULT NULL,
  `userTime` varchar(255) DEFAULT NULL,
  `timeZone` varchar(255) DEFAULT NULL,
  `timeReceived` varchar(255) DEFAULT NULL,
  `status` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb3;

-- ----------------------------
-- Records of remotes
-- ----------------------------
BEGIN;
INSERT INTO `remotes` VALUES (1, 100866, 'Aaron', 'Feb-20-2023 09:00:00 AM', 'Feb-20-2023 21:00:00 PM', 'Asia/Shanghai', 'Feb-20-2023 12:11:20 PM', 1);
INSERT INTO `remotes` VALUES (2, 100866, 'Aaron', 'Feb-23-2023 13:00:00 PM', 'Feb-24-2023 01:00:00 AM', 'Asia/Shanghai', 'Feb-20-2023 12:12:16 PM', 0);
INSERT INTO `remotes` VALUES (3, 100866, 'Aaron', 'Feb-27-2023 19:00:00 PM', 'Feb-28-2023 07:00:00 AM', 'Asia/Shanghai', 'Feb-20-2023 12:14:50 PM', 1);
INSERT INTO `remotes` VALUES (4, 100866, 'Aaron', 'Feb-22-2023 16:00:00 PM', 'Feb-23-2023 04:00:00 AM', 'Asia/Shanghai', 'Feb-21-2023 23:32:39 PM', 1);
INSERT INTO `remotes` VALUES (5, 100866, 'Aaron', 'Feb-28-2023 15:00:00 PM', 'Mar-01-2023 03:00:00 AM', 'Asia/Shanghai', 'Feb-22-2023 12:26:41 PM', 0);
INSERT INTO `remotes` VALUES (6, 100866, 'Aaron', 'Feb-24-2023 20:00:00 PM', 'Feb-25-2023 08:00:00 AM', 'Asia/Shanghai', 'Feb-23-2023 10:26:59 AM', 1);
INSERT INTO `remotes` VALUES (7, 100866, 'Aaron', 'Mar-29-2023 13:00:00 PM', 'Mar-30-2023 00:00:00 AM', 'Asia/Shanghai', 'Feb-23-2023 23:33:38 PM', 0);
INSERT INTO `remotes` VALUES (8, 100888, 'Kristina', 'Mar-22-2023 14:00:00 PM', 'Mar-23-2023 01:00:00 AM', 'Asia/Shanghai', 'Feb-26-2023 12:34:51 PM', 0);
INSERT INTO `remotes` VALUES (9, 100888, 'Kristina', 'Mar-17-2023 18:00:00 PM', 'Mar-18-2023 05:00:00 AM', 'Asia/Shanghai', 'Feb-26-2023 12:34:56 PM', 1);
INSERT INTO `remotes` VALUES (10, 100888, 'Kristina', 'Mar-30-2023 17:00:00 PM', 'Mar-31-2023 04:00:00 AM', 'Asia/Shanghai', 'Feb-26-2023 12:35:00 PM', 1);
INSERT INTO `remotes` VALUES (11, 123456, 'Kristina', 'Apr-27-2023 12:00:00 PM', 'Apr-27-2023 23:00:00 PM', 'Asia/Shanghai', 'Feb-26-2023 14:21:43 PM', 1);
INSERT INTO `remotes` VALUES (12, 123456, 'Kristina', 'Dec-31-2022 12:00:00 PM', 'Jan-01-2023 00:00:00 AM', 'Asia/Shanghai', 'Feb-26-2023 16:45:37 PM', 0);
INSERT INTO `remotes` VALUES (13, 123456, 'Kristina', 'Dec-31-2022 12:00:00 PM', 'Jan-01-2023 00:00:00 AM', 'Asia/Shanghai', 'Feb-26-2023 16:49:42 PM', 1);
INSERT INTO `remotes` VALUES (14, 123456, 'Kristina', 'Feb-27-2023 14:00:00 PM', 'Feb-28-2023 02:00:00 AM', 'Asia/Shanghai', 'Feb-26-2023 16:57:06 PM', 1);
INSERT INTO `remotes` VALUES (15, 123456, 'Kristina', 'Feb-28-2023 14:00:00 PM', 'Mar-01-2023 02:00:00 AM', 'Asia/Shanghai', 'Feb-26-2023 16:58:45 PM', 1);
INSERT INTO `remotes` VALUES (16, 123456, 'Kristina', 'Feb-28-2023 15:00:00 PM', 'Mar-01-2023 03:00:00 AM', 'Asia/Shanghai', 'Feb-26-2023 17:08:10 PM', 1);
INSERT INTO `remotes` VALUES (17, 123456, 'Kristina', 'Feb-28-2023 12:00:00 PM', 'Mar-01-2023 00:00:00 AM', 'Asia/Shanghai', 'Feb-26-2023 17:31:45 PM', 1);
INSERT INTO `remotes` VALUES (18, 123456, 'Kristina', 'Mar-30-2023 05:00:00 AM', 'Mar-30-2023 05:00:00 AM', 'America/Halifax', 'Feb-26-2023 18:08:21 PM', 1);
INSERT INTO `remotes` VALUES (19, 123456, 'Kristina', 'Mar-16-2023 04:00:00 AM', 'Mar-16-2023 04:00:00 AM', 'America/Halifax', 'Feb-26-2023 18:09:05 PM', 1);
INSERT INTO `remotes` VALUES (20, 123456, 'Kristina', 'Mar-24-2023 03:00:00 AM', 'Mar-24-2023 03:00:00 AM', 'America/Halifax', 'Feb-26-2023 18:09:50 PM', 1);
INSERT INTO `remotes` VALUES (21, 123456, 'Kristina', 'Feb-28-2023 03:00:00 AM', 'Feb-28-2023 03:00:00 AM', 'America/Halifax', 'Feb-26-2023 18:10:32 PM', 1);
INSERT INTO `remotes` VALUES (22, 123456, 'Kristina', 'Feb-28-2023 03:00:00 AM', 'Feb-28-2023 03:00:00 AM', 'America/Halifax', 'Feb-26-2023 18:11:00 PM', 1);
INSERT INTO `remotes` VALUES (23, 123456, 'Kristina', 'Mar-24-2023 05:00:00 AM', 'Mar-24-2023 05:00:00 AM', 'America/Halifax', 'Feb-26-2023 18:19:54 PM', 1);
INSERT INTO `remotes` VALUES (24, 123456, 'Kristina', 'Feb-28-2023 04:00:00 AM', 'Feb-28-2023 04:00:00 AM', 'America/Halifax', 'Feb-26-2023 18:27:14 PM', 1);
INSERT INTO `remotes` VALUES (25, 123456, 'Kristina', 'Feb-28-2023 05:00:00 AM', 'Feb-28-2023 05:00:00 AM', 'America/Halifax', 'Feb-26-2023 18:28:04 PM', 1);
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
