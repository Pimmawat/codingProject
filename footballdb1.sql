-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 12, 2024 at 06:47 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `footballdb1`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(10) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `username`, `password`, `role`, `created_at`) VALUES
(1, 'admin', '$2b$12$UcjX7cNqtsKeM05BZCow/uS26JA1uNkc8JZLmG8ooRpzH2Eu5Jfm6', 'admin', '2024-12-06 18:56:20');

-- --------------------------------------------------------

--
-- Table structure for table `points`
--

CREATE TABLE `points` (
  `point_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `points` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `points`
--

INSERT INTO `points` (`point_id`, `user_id`, `booking_id`, `points`, `created_at`) VALUES
(11, 25, 13, 20, '2024-12-10 11:28:18'),
(21, 25, 23, 20, '2024-12-11 03:09:36'),
(22, 38, 24, 20, '2024-12-12 00:31:25'),
(23, 38, 25, 20, '2024-12-12 00:34:12'),
(24, 38, 26, 20, '2024-12-12 00:34:31'),
(25, 38, 27, 20, '2024-12-12 00:34:50'),
(26, 38, 28, 20, '2024-12-12 00:35:18'),
(30, 38, 32, -100, '2024-12-12 23:51:44');

-- --------------------------------------------------------

--
-- Table structure for table `reserve`
--

CREATE TABLE `reserve` (
  `booking_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `field` varchar(100) NOT NULL,
  `date` varchar(255) NOT NULL,
  `startTime` varchar(255) NOT NULL,
  `endTime` varchar(255) NOT NULL,
  `timeUsed` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reserve`
--

INSERT INTO `reserve` (`booking_id`, `user_id`, `field`, `date`, `startTime`, `endTime`, `timeUsed`, `created_at`) VALUES
(13, 25, 'สนาม 1', '2024-12-10', '16:00', '18:00', 2, '2024-12-10 11:28:18'),
(23, 25, 'สนาม 1', '2024-12-11', '19:00', '21:00', 2, '2024-12-11 03:09:36'),
(24, 38, 'สนาม 1', '2024-12-12', '15:00', '17:00', 2, '2024-12-12 00:31:25'),
(25, 38, 'สนาม 1', '2024-12-12', '12:00', '14:00', 2, '2024-12-12 00:34:12'),
(26, 38, 'สนาม 1', '2024-12-12', '17:00', '19:00', 2, '2024-12-12 00:34:31'),
(27, 38, 'สนาม 1', '2024-12-12', '19:00', '21:00', 2, '2024-12-12 00:34:50'),
(28, 38, 'สนาม 1', '2024-12-12', '21:00', '23:00', 2, '2024-12-12 00:35:18'),
(32, 38, 'สนาม 2', '2024-12-13', '12:00', '13:00', 1, '2024-12-12 23:51:44');

-- --------------------------------------------------------

--
-- Table structure for table `used_tokens`
--

CREATE TABLE `used_tokens` (
  `id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `used_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `used_tokens`
--

INSERT INTO `used_tokens` (`id`, `token`, `used_at`) VALUES
(1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InBodW1hMTEwNUBnbWFpbC5jb20iLCJpYXQiOjE3MzM5NDU0MjksImV4cCI6MTczMzk0OTAyOX0.igDSGpK75WWYh3z8Jex_RCw6BdrrCu8mErdMYauStFc', '2024-12-11 19:30:44');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `otp` varchar(6) DEFAULT NULL,
  `otp_expiry` datetime DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `created_at`, `updated_at`, `otp`, `otp_expiry`, `is_verified`) VALUES
(25, '_thephuuu', 'phuma1105@gmail.com', '0931713860', '$2b$10$ZmoUrK2i9O6FB0IP.QqHkOylObply/fwWYL8dssai5h7GGnRuUtei', '2024-12-10 11:08:53', '2024-12-12 02:30:44', NULL, NULL, 1),
(38, 'waytakaaaaa', 'waytaka8998@gmail.com', '0931713863', '$2b$10$.xkB9Gbebdpr1cECNuUaou4XOYM6eSc1YrHTl/u2ibuatJDPGnWPe', '2024-12-12 00:30:22', '2024-12-13 00:22:38', NULL, NULL, 1),
(44, 'fdsfds', 'ffdsfsdf', 'fdsfsdf', 'fsdfsd', '2024-12-12 03:58:48', '2024-12-12 03:58:48', NULL, NULL, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `points`
--
ALTER TABLE `points`
  ADD PRIMARY KEY (`point_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Indexes for table `reserve`
--
ALTER TABLE `reserve`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `used_tokens`
--
ALTER TABLE `used_tokens`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone` (`phone`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `points`
--
ALTER TABLE `points`
  MODIFY `point_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `reserve`
--
ALTER TABLE `reserve`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `used_tokens`
--
ALTER TABLE `used_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `points`
--
ALTER TABLE `points`
  ADD CONSTRAINT `points_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `points_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `reserve` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `reserve`
--
ALTER TABLE `reserve`
  ADD CONSTRAINT `reserve_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
